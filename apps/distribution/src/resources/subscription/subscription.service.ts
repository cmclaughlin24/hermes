import { MissingException } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { DistributionEventService } from '../distribution-event/distribution-event.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionRepository } from './repository/subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly repository: SubscriptionRepository,
    private readonly distributionEventService: DistributionEventService,
  ) {}

  /**
   * Yields a list of Subscriptions.
   */
  async findAll() {
    return this.repository.findAll();
  }

  /**
   * Yields a Subscription.
   * @param {string} eventType
   * @param {string} subscriberId
   */
  async findOne(eventType: string, subscriberId: string) {
    // TODO: Investigate converting this validation check into a parameter decorator or allowing
    // the repository to through an error.
    const distributionEvent = await this._getDistributionEvent(eventType);

    return this.repository.findOne(distributionEvent.eventType, subscriberId);
  }

  /**
   * Creates a Subscription. Throws a MissingException if a DistributionEvent does
   * not exist in the repository for the eventType or ExistsException
   * if a subscription id exists in the repository.
   * @param {CreateSubscriptionDto} createSubscriptionDto
   */
  async create(createSubscriptionDto: CreateSubscriptionDto) {
    // TODO: Investigate converting this validation check into a parameter decorator or allowing
    // the repository to through an error.
    await this._getDistributionEvent(createSubscriptionDto.eventType);

    return this.repository.create(createSubscriptionDto);
  }

  /**
   * Updates a Subscription or throws a MissingException if the repository
   * returns null or undefined.
   * @param {string} eventType
   * @param {string} subscriberId
   * @param {UpdateSubscriptionDto} updateSubscriptionDto
   */
  async update(
    eventType: string,
    subscriberId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    // TODO: Investigate converting this validation check into a parameter decorator or allowing
    // the repository to through an error.
    await this._getDistributionEvent(eventType);

    return this.repository.update(
      eventType,
      subscriberId,
      updateSubscriptionDto,
    );
  }

  /**
   * Removes a Subscription from all distribution events or throws a MissingException
   * if the repository returns null or undefined.
   * @param {string} subscriberId
   */
  async removeAll(subscriberId: string) {
    await this.repository.removeAll(subscriberId);
  }

  /**
   * Removes a Subscription or throws a MissingException if the repository
   * returns null or undefined.
   * @param {string} eventType
   * @param {string} subscriberId
   */
  async remove(eventType: string, subscriberId: string) {
    // TODO: Investigate converting this validation check into a parameter decorator or allowing
    // the repository to through an error.
    await this._getDistributionEvent(eventType);

    await this.repository.remove(eventType, subscriberId);
  }

  /**
   * Yields a DistributionEvent or throws a MissingException if it does
   * not exist.
   * @param {string} eventType
   */
  private async _getDistributionEvent(eventType: string) {
    const distributionEvent =
      await this.distributionEventService.findOne(eventType);

    if (!distributionEvent) {
      throw new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
    }

    return distributionEvent;
  }
}
