import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '@notification/common';
import * as _ from 'lodash';
import { Sequelize } from 'sequelize-typescript';
import { DistributionRuleService } from '../distribution-rule/distribution-rule.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription)
    private readonly subscriptionModel: typeof Subscription,
    private readonly distributionRuleService: DistributionRuleService,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Yields a list of Subscriptions or throws a NotFoundException if
   * the repository returns null, undefined, or an empty list.
   * @returns {Promise<Subscription[]>}
   */
  async findAll() {
    const subscriptions = await this.subscriptionModel.findAll({
      include: [SubscriptionFilter],
    });

    if (_.isEmpty(subscriptions)) {
      throw new NotFoundException('Subscriptions not found!');
    }

    return subscriptions;
  }

  /**
   * Yields a Subscription or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} id
   * @returns {Promise<Subscription>}
   */
  async findOne(id: string) {
    const subscription = await this.subscriptionModel.findByPk(id);

    if (!subscription) {
      throw new NotFoundException(`Subscription with ${id} not found!`);
    }

    return subscription;
  }

  /**
   * Creates a Subscription. Throws a NotFoundException if a DistributionRule does
   * not exist in the repository for the queue and messageType or BadRequestException
   * if a subscription id exists in the repository.
   * @param {CreateSubscriptionDto} createSubscriptionDto
   * @returns {Promise<ApiResponseDto<Subscription>>}
   */
  async create(createSubscriptionDto: CreateSubscriptionDto) {
    // Note: Throws a NotFoundException if the distribution rule does not exits.
    const distributionRule = await this.distributionRuleService.findOne(
      createSubscriptionDto.queue,
      createSubscriptionDto.messageType,
    );
    const existingSubscription = await this.subscriptionModel.findByPk(
      createSubscriptionDto.id,
    );

    if (existingSubscription) {
      throw new BadRequestException(
        `Subscription ${createSubscriptionDto.id} already exists!`,
      );
    }

    const subscription = await this.subscriptionModel.create(
      {
        id: createSubscriptionDto.id,
        distributionRuleId: distributionRule.id,
        url: createSubscriptionDto.url,
        filterJoin: createSubscriptionDto.filterJoin,
        filters: createSubscriptionDto.filters,
      },
      { include: [SubscriptionFilter] },
    );

    return new ApiResponseDto<Subscription>(
      `Successfully created subscription!`,
      subscription,
    );
  }

  /**
   * Updates a Subscription or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} id
   * @param {UpdateSubscriptionDto} updateSubscriptionDto
   * @returns {Promise<ApiResponseDto<Subscription>>}
   */
  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    // Fixme: Run update operation on a transaction.
    let subscription = await this.subscriptionModel.findByPk(id, {
      include: [SubscriptionFilter],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ${id} not found!`);
    }

    if (!_.isEmpty(updateSubscriptionDto.filters)) {
      for (const filter of updateSubscriptionDto.filters) {
        const existingFilter = subscription.filters.find(
          (curr) => curr.field === filter.field,
        );

        if (!existingFilter) {
          // Todo: Create a new filter for the subscription.
        } else {
          // Todo: Update the existing filter.
        }
      }
      // Todo: Remove filters that are no longer defined.
    }

    subscription = await subscription.update({
      url: updateSubscriptionDto.url,
      filterJoin: updateSubscriptionDto.filterJoin,
    });

    return new ApiResponseDto<Subscription>(
      `Successfully updated subscription!`,
      subscription,
    );
  }

  /**
   * Removes a Subscription or throws a NotFoundException if the repository
   * return null or undefined.
   * @param {string} id
   * @returns {Promise<ApiResponseDto>}
   */
  async remove(id: string) {
    const subscription = await this.subscriptionModel.findByPk(id);

    if (!subscription) {
      throw new NotFoundException(`Subscription with ${id} not found!`);
    }

    // Note: The delete is cascaded to the SubscriptionFilters table.
    await subscription.destroy();

    return new ApiResponseDto(`Successfully deleted subscription ${id}!`);
  }
}
