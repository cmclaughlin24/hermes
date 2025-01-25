import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionRepository } from './subscription.repository';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { ExistsException, MissingException } from '@hermes/common';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { SubscriptionFilterDto } from '../dto/subscription-filter.dto';

@Injectable()
export class OrmSubscriptionRepository implements SubscriptionRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionModel: Repository<Subscription>,
    @InjectRepository(SubscriptionFilter)
    private readonly subscriptionFilterModel: Repository<SubscriptionFilter>,
  ) {}

  async findAll() {
    return this.subscriptionModel.find({
      relations: { filters: true },
    });
  }

  async findOne(eventType: string, subscriberId: string) {
    return this.subscriptionModel.findOne({
      where: {
        subscriberId: subscriberId,
        distributionEventType: eventType,
      },
      relations: { filters: true },
    });
  }

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const existingSubscription = await this.subscriptionModel.findOne({
      where: {
        subscriberId: createSubscriptionDto.subscriberId,
        distributionEventType: createSubscriptionDto.eventType,
      },
    });

    if (existingSubscription) {
      throw new ExistsException(
        `Subscription ${createSubscriptionDto.subscriberId} already exists!`,
      );
    }

    const filters =
      createSubscriptionDto.filters?.map((filter) =>
        this.subscriptionFilterModel.create(filter),
      ) ?? [];

    const subscription = this.subscriptionModel.create({
      distributionEventType: createSubscriptionDto.eventType,
      subscriberId: createSubscriptionDto.subscriberId,
      subscriptionType: createSubscriptionDto.subscriptionType,
      data: createSubscriptionDto.data,
      filterJoin: createSubscriptionDto.filterJoin,
      filters,
    });

    return this.subscriptionModel.save(subscription);
  }

  async update(
    eventType: string,
    subscriberId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    const subscription = await this.subscriptionModel.findOne({
      where: {
        distributionEventType: eventType,
        subscriberId: subscriberId,
      },
    });

    if (!subscription) {
      throw new MissingException(
        `Subscription with eventType=${eventType} subscriberId=${subscriberId} not found!`,
      );
    }

    subscription.data = updateSubscriptionDto.data ?? subscription.data;
    subscription.filterJoin =
      updateSubscriptionDto.filterJoin ?? subscription.filterJoin;
    subscription.filters =
      updateSubscriptionDto.filters &&
      (await Promise.all(
        updateSubscriptionDto.filters.map((filter) =>
          this._preloadSubscriptionFilter(subscription.id, filter),
        ),
      ));

    return this.subscriptionModel.save(subscription);
  }

  async removeAll(subscriberId: string) {
    const subscriptions = await this.subscriptionModel.find({
      where: { subscriberId },
    });

    if (!subscriptions?.length) {
      throw new MissingException(
        `Subscription(s) with subscriberId=${subscriberId} not found!`,
      );
    }

    await this.subscriptionModel.remove(subscriptions);
  }

  async remove(eventType: string, subscriberId: string) {
    const subscription = await this.subscriptionModel.findOne({
      where: {
        subscriberId: subscriberId,
        distributionEventType: eventType,
      },
    });

    if (!subscription) {
      throw new MissingException(
        `Subscription with eventType=${eventType} subscriberId=${subscriberId} not found!`,
      );
    }

    // NOTE: The delete is cascaded to the SubscriptionFilters table.
    await this.subscriptionModel.remove(subscription);
  }

  private async _preloadSubscriptionFilter(
    subscriptionId: string,
    filterDto: SubscriptionFilterDto,
  ) {
    const filter = await this.subscriptionFilterModel.preload({
      subscriptionId,
      ...filterDto,
    });

    if (filter) {
      return filter;
    }

    return this.subscriptionFilterModel.create(filterDto);
  }
}
