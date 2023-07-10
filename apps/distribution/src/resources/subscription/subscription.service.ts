import { ApiResponseDto } from '@hermes/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { DistributionEventService } from '../distribution-event/distribution-event.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionFilterDto } from './dto/subscription-filter.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription)
    private readonly subscriptionModel: typeof Subscription,
    @InjectModel(SubscriptionFilter)
    private readonly subscriptionFilterModel: typeof SubscriptionFilter,
    private readonly distributionEventService: DistributionEventService,
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
   * @param {string} queue
   * @param {string} eventType
   * @param {string} externalId
   * @returns {Promise<Subscription>}
   */
  async findOne(queue: string, eventType: string, externalId: string) {
    // Note: Throws a NotFoundException if the distribution event does not exits.
    const distributionEvent = await this.distributionEventService.findOne(
      queue,
      eventType,
    );
    const subscription = await this.subscriptionModel.findOne({
      where: {
        externalId: externalId,
        distributionEventId: distributionEvent.id,
      },
      include: [SubscriptionFilter],
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription with queue=${queue} eventType=${eventType} externalId=${externalId} not found!`,
      );
    }

    return subscription;
  }

  /**
   * Creates a Subscription. Throws a NotFoundException if a DistributionEvent does
   * not exist in the repository for the queue and eventType or BadRequestException
   * if a subscription id exists in the repository.
   * @param {CreateSubscriptionDto} createSubscriptionDto
   * @returns {Promise<ApiResponseDto<Subscription>>}
   */
  async create(createSubscriptionDto: CreateSubscriptionDto) {
    // Note: Throws a NotFoundException if the distribution event does not exits.
    const distributionEvent = await this.distributionEventService.findOne(
      createSubscriptionDto.queue,
      createSubscriptionDto.eventType,
    );
    const existingSubscription = await this.subscriptionModel.findOne({
      where: {
        externalId: createSubscriptionDto.externalId,
        distributionEventId: distributionEvent.id,
      },
    });

    if (existingSubscription) {
      throw new BadRequestException(
        `Subscription ${createSubscriptionDto.externalId} already exists!`,
      );
    }

    const subscription = await this.subscriptionModel.create(
      {
        distributionEventId: distributionEvent.id,
        externalId: createSubscriptionDto.externalId,
        subscriptionType: createSubscriptionDto.subscriptionType,
        data: createSubscriptionDto.data,
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
   * @param {string} queue
   * @param {string} eventType
   * @param {string} externalId
   * @param {UpdateSubscriptionDto} updateSubscriptionDto
   * @returns {Promise<ApiResponseDto<Subscription>>}
   */
  async update(
    queue: string,
    eventType: string,
    externalId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      // Note: Throws a NotFoundException if the distribution event does not exits.
      const distributionEvent = await this.distributionEventService.findOne(
        queue,
        eventType,
      );
      let subscription = await this.subscriptionModel.findOne({
        where: {
          externalId: externalId,
          distributionEventId: distributionEvent.id,
        },
        include: [SubscriptionFilter],
        transaction,
      });

      if (!subscription) {
        throw new NotFoundException(
          `Subscription with queue=${queue} eventType=${eventType} externalId=${externalId} not found!`,
        );
      }

      subscription = await subscription.update(
        {
          data: updateSubscriptionDto.data ?? subscription.data,
          filterJoin:
            updateSubscriptionDto.filterJoin ?? subscription.filterJoin,
        },
        { transaction },
      );

      // Note: All existing SubscriptionFilters should be removed on an empty array.
      if (updateSubscriptionDto.filters) {
        await this._updateSubscriptionFilters(
          subscription,
          updateSubscriptionDto.filters,
          transaction,
        );

        subscription = await subscription.reload({ transaction });
      }

      return new ApiResponseDto<Subscription>(
        `Successfully updated subscription!`,
        subscription,
      );
    });
  }

  /**
   * Removes a Subscription from all distribution events or throws a NotFoundException
   * if the repository returns null or undefined.
   * @param {string} externalId
   * @returns {Promise<ApiResponseDto>}
   */
  async removeAll(externalId: string) {
    const subscription = await this.subscriptionModel.findOne({
      where: { externalId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription(s) with externalId=${externalId} not found!`,
      );
    }

    await this.subscriptionModel.destroy({
      where: { externalId },
    });

    return new ApiResponseDto(
      `Successfully deleted subscription externalId=${externalId} from all distribution event(s)!`,
    );
  }

  /**
   * Removes a Subscription or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} eventType
   * @param {string} externalId
   * @returns {Promise<ApiResponseDto>}
   */
  async remove(queue: string, eventType: string, externalId: string) {
    // Note: Throws a NotFoundException if the distribution event does not exits.
    const distributionEvent = await this.distributionEventService.findOne(
      queue,
      eventType,
    );
    const subscription = await this.subscriptionModel.findOne({
      where: {
        externalId: externalId,
        distributionEventId: distributionEvent.id,
      },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription with queue=${queue} eventType=${eventType} externalId=${externalId} not found!`,
      );
    }

    // Note: The delete is cascaded to the SubscriptionFilters table.
    await subscription.destroy();

    return new ApiResponseDto(
      `Successfully deleted subscription queue=${queue} eventType=${eventType} externalId=${externalId}!`,
    );
  }

  /**
   * Creates, updates, or removes filters for a subscription.
   * @param {Subscription} subscription
   * @param {SubscriptionFilterDto} filters
   * @param {Transaction} transaction
   */
  private async _updateSubscriptionFilters(
    subscription: Subscription,
    filters: SubscriptionFilterDto[],
    transaction: Transaction,
  ) {
    // Todo: Refactor add/update/remove logic into one for-of loop if possible.
    for (const existingFilter of subscription.filters) {
      const filter = filters.find(
        (filterDto) => filterDto.field === existingFilter.field,
      );

      if (filter) {
        continue;
      }

      await existingFilter.destroy({ transaction });
    }

    for (const filter of filters) {
      const existingFilter = subscription.filters.find(
        (curr) => curr.field === filter.field,
      );

      if (!existingFilter) {
        await this.subscriptionFilterModel.create(
          {
            subscriptionId: subscription.id,
            field: filter.field,
            operator: filter.operator,
            value: filter.value,
            dataType: filter.dataType,
          },
          { transaction },
        );
      } else {
        await existingFilter.update(
          {
            operator: filter.operator ?? existingFilter.operator,
            value: filter.value ?? existingFilter.value,
            dataType: filter.dataType ?? existingFilter.value,
          },
          { transaction },
        );
      }
    }
  }
}
