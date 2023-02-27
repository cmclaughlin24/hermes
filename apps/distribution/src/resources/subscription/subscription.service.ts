import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '@notification/common';
import * as _ from 'lodash';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription)
    private readonly subscriptionModel: typeof Subscription,
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
    const subscription = await this.subscriptionModel.create(
      {
        ...createSubscriptionDto,
      },
      { include: [SubscriptionFilter] },
    );

    return new ApiResponseDto<Subscription>(
      `Successfully create subscription!`,
      subscription,
    );
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.subscriptionModel.findByPk(id);

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
