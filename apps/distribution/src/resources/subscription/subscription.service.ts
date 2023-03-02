import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '@notification/common';
import * as _ from 'lodash';
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
  ) {}

  async findAll() {
    const subscriptions = await this.subscriptionModel.findAll();

    if (_.isEmpty(subscriptions)) {
      throw new NotFoundException('Subscriptions not found!');
    }

    return subscriptions;
  }

  async findOne(id: string) {
    const subscription = await this.subscriptionModel.findByPk(id);

    if (!subscription) {
      throw new NotFoundException(`Subscription with ${id} not found!`);
    }

    return subscription;
  }

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    // Note: Throws a NotFoundException if the distribution rule does not exits.
    const distributionRule = await this.distributionRuleService.findOne(
      createSubscriptionDto.queue,
      createSubscriptionDto.rule,
    );

    // Todo: Include SubscriptionFilters in create.
    const subscription = await this.subscriptionModel.create({
      id: createSubscriptionDto.id,
      distributionRuleId: distributionRule.id,
      url: createSubscriptionDto.url,
      filterJoin: createSubscriptionDto.filterJoin,
    });

    return new ApiResponseDto<Subscription>(
      `Successfully created subscription!`,
      subscription,
    );
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.subscriptionModel.findByPk(id, {
      include: [SubscriptionFilter],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ${id} not found!`);
    }

    return new ApiResponseDto<Subscription>(
      `Successfully updated subscription!`,
      subscription,
    );
  }

  async remove(id: string) {
    const subscription = await this.subscriptionModel.findByPk(id);

    if (!subscription) {
      throw new NotFoundException(`Subscription with ${id} not found!`);
    }

    await subscription.destroy();

    return new ApiResponseDto(`Successfully deleted subscription ${id}!`);
  }
}
