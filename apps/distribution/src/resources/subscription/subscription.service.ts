import { ExistsException, MissingException } from '@hermes/common';
import {
  Injectable
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
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
   * Yields a list of Subscriptions.
   * @returns {Promise<Subscription[]>}
   */
  async findAll() {
    return this.subscriptionModel.findAll({
      include: [SubscriptionFilter],
    });
  }

  /**
   * Yields a Subscription.
   * @param {string} queue
   * @param {string} eventType
   * @param {string} subscriberId
   * @returns {Promise<Subscription>}
   */
  async findOne(queue: string, eventType: string, subscriberId: string) {
    const distributionEvent = await this._getDistributionEvent(
      queue,
      eventType,
    );

    return this.subscriptionModel.findOne({
      where: {
        subscriberId: subscriberId,
        distributionEventId: distributionEvent.id,
      },
      include: [SubscriptionFilter],
    });
  }

  /**
   * Creates a Subscription. Throws a MissingException if a DistributionEvent does
   * not exist in the repository for the queue and eventType or ExistsException
   * if a subscription id exists in the repository.
   * @param {CreateSubscriptionDto} createSubscriptionDto
   * @returns {Promise<Subscription>}
   */
  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const distributionEvent = await this._getDistributionEvent(
      createSubscriptionDto.queue,
      createSubscriptionDto.eventType,
    );
    const existingSubscription = await this.subscriptionModel.findOne({
      where: {
        subscriberId: createSubscriptionDto.subscriberId,
        distributionEventId: distributionEvent.id,
      },
    });

    if (existingSubscription) {
      throw new ExistsException(
        `Subscription ${createSubscriptionDto.subscriberId} already exists!`,
      );
    }

    const subscription = await this.subscriptionModel.create(
      {
        distributionEventId: distributionEvent.id,
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

  /**
   * Updates a Subscription or throws a MissingException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} eventType
   * @param {string} subscriberId
   * @param {UpdateSubscriptionDto} updateSubscriptionDto
   * @returns {Promise<Subscription>}
   */
  async update(
    queue: string,
    eventType: string,
    subscriberId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      const distributionEvent = await this._getDistributionEvent(
        queue,
        eventType,
      );
      let subscription = await this.subscriptionModel.findOne({
        where: {
          subscriberId: subscriberId,
          distributionEventId: distributionEvent.id,
        },
        include: [SubscriptionFilter],
        transaction,
      });

      if (!subscription) {
        throw new MissingException(
          `Subscription with queue=${queue} eventType=${eventType} subscriberId=${subscriberId} not found!`,
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

      return subscription;
    });
  }

  /**
   * Removes a Subscription from all distribution events or throws a MissingException
   * if the repository returns null or undefined.
   * @param {string} subscriberId
   * @returns {Promise<void>}
   */
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

  /**
   * Removes a Subscription or throws a MissingException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} eventType
   * @param {string} subscriberId
   * @returns {Promise<void>}
   */
  async remove(queue: string, eventType: string, subscriberId: string) {
    const distributionEvent = await this._getDistributionEvent(
      queue,
      eventType,
    );
    const subscription = await this.subscriptionModel.findOne({
      where: {
        subscriberId: subscriberId,
        distributionEventId: distributionEvent.id,
      },
    });

    if (!subscription) {
      throw new MissingException(
        `Subscription with queue=${queue} eventType=${eventType} subscriberId=${subscriberId} not found!`,
      );
    }

    // Note: The delete is cascaded to the SubscriptionFilters table.
    await subscription.destroy();
  }

  /**
   * Yields a DistributionEvent or throws a MissingException if it does
   * not exist.
   * @param {string} queue
   * @param {string} eventType
   * @returns {Promise<DistributionEvent>}
   */
  private async _getDistributionEvent(queue: string, eventType: string) {
    const distributionEvent = await this.distributionEventService.findOne(
      queue,
      eventType,
    );

    if (!distributionEvent) {
      throw new MissingException(
        `Distribution Event for queue=${queue} eventType=${eventType} not found!`,
      );
    }

    return distributionEvent;
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
