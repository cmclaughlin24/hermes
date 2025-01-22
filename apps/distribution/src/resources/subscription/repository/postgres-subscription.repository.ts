import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repository';
import { InjectModel } from '@nestjs/sequelize';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Sequelize } from 'sequelize-typescript';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { ExistsException, MissingException } from '@hermes/common';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { SubscriptionFilterDto } from '../dto/subscription-filter.dto';
import { Transaction } from 'sequelize';

@Injectable()
export class PostgresSubscriptionRepository implements SubscriptionRepository {
  constructor(
    @InjectModel(Subscription)
    private readonly subscriptionModel: typeof Subscription,
    @InjectModel(SubscriptionFilter)
    private readonly subscriptionFilterModel: typeof SubscriptionFilter,
    private readonly sequelize: Sequelize,
  ) {}

  async findAll() {
    return this.subscriptionModel.findAll({
      include: [SubscriptionFilter],
    });
  }

  async findOne(eventType: string, subscriberId: string) {
    return this.subscriptionModel.findOne({
      where: {
        subscriberId: subscriberId,
        distributionEventType: eventType,
      },
      include: [SubscriptionFilter],
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

    const subscription = await this.subscriptionModel.create(
      {
        distributionEventType: createSubscriptionDto.eventType,
        subscriberId: createSubscriptionDto.subscriberId,
        subscriptionType: createSubscriptionDto.subscriptionType,
        data: createSubscriptionDto.data,
        filterJoin: createSubscriptionDto.filterJoin,
        filters: createSubscriptionDto.filters,
      },
      { include: [SubscriptionFilter] },
    );

    return subscription;
  }

  async update(
    eventType: string,
    subscriberId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      let subscription = await this.subscriptionModel.findOne({
        where: {
          subscriberId: subscriberId,
          distributionEventType: eventType,
        },
        include: [SubscriptionFilter],
        transaction,
      });

      if (!subscription) {
        throw new MissingException(
          `Subscription with eventType=${eventType} subscriberId=${subscriberId} not found!`,
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

      // NOTE: All existing SubscriptionFilters should be removed on an empty array.
      if (updateSubscriptionDto.filters) {
        await this._updateSubscriptionFilters(
          subscription,
          updateSubscriptionDto.filters,
          transaction,
        );

        subscription = await subscription.reload({ transaction });
      }

      return subscription;
    });
  }

  async removeAll(subscriberId: string) {
    const subscription = await this.subscriptionModel.findOne({
      where: { subscriberId },
    });

    if (!subscription) {
      throw new MissingException(
        `Subscription(s) with subscriberId=${subscriberId} not found!`,
      );
    }

    await this.subscriptionModel.destroy({
      where: { subscriberId },
    });
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
    await subscription.destroy();
  }

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
