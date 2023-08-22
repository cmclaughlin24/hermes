import {
  ExistsException,
  MissingException
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DistributionRule } from '../distribution-rule/entities/distribution-rule.entity';
import { SubscriptionFilter } from '../subscription/entities/subscription-filter.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './entities/distribution-event.entity';
import { DefaultRuleException } from './errors/default-rule.exception';

@Injectable()
export class DistributionEventService {
  constructor(
    @InjectModel(DistributionEvent)
    private readonly distributionEventModel: typeof DistributionEvent,
  ) {}

  /**
   * Yields a list of DistributionEvents.
   * @param {boolean} includeRules
   * @param {boolean} includeSubscriptions
   * @returns {Promise<DistributionEvent[]>}
   */
  async findAll(includeRules: boolean, includeSubscriptions: boolean) {
    return this.distributionEventModel.findAll({
      include: this._buildIncludes(includeRules, includeSubscriptions),
    });
  }

  /**
   * Yields a DistributionEvent.
   * @param {string} queue
   * @param {string} eventType
   * @param {boolean} includeRules
   * @param {boolean} includeSubscriptions
   * @returns {Promise<DistributionEvent>}
   */
  async findOne(
    queue: string,
    eventType: string,
    includeRules: boolean = false,
    includeSubscriptions: boolean = false,
  ) {
    return this.distributionEventModel.findOne({
      where: { queue, eventType },
      include: this._buildIncludes(includeRules, includeSubscriptions),
    });
  }

  /**
   * Creates a DistributionEvent. Throws an ExistsException if a distribution event
   * for a queue and eventType exists in the repository or a DefaultRuleExcpetion if
   * an event does not have a default distribution rule.
   * @param {CreateDistributionEventDto} createDistributionEventDto
   * @returns {Promise<DistributionEvent>}
   */
  async create(createDistributionEventDto: CreateDistributionEventDto) {
    const existingEvent = await this.distributionEventModel.findOne({
      where: {
        queue: createDistributionEventDto.queue,
        eventType: createDistributionEventDto.eventType,
      },
    });

    if (existingEvent) {
      throw new ExistsException(
        `Distribution Event for queue=${createDistributionEventDto.queue} eventType=${createDistributionEventDto.eventType} already exists!`,
      );
    }

    const hasDefaultRule = createDistributionEventDto.rules?.some(
      (rule) => rule.metadata == null,
    );

    if (!hasDefaultRule) {
      throw new DefaultRuleException(
        `Distribution Event for queue=${createDistributionEventDto.queue} eventType=${createDistributionEventDto.eventType} must have a default distribution rule (metadata=null)`,
      );
    }

    const distributionEvent = await this.distributionEventModel.create(
      {
        ...createDistributionEventDto,
      },
      { include: [DistributionRule] },
    );

    return distributionEvent;
  }

  /**
   * Updates a DistributionEvent or throws a MissingException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} eventType
   * @param {UpdateDistributionEventDto} updateDistributionEventDto
   * @returns {Promise<DistributionEvent>}
   */
  async update(
    queue: string,
    eventType: string,
    updateDistributionEventDto: UpdateDistributionEventDto,
  ) {
    let distributionEvent = await this.distributionEventModel.findOne({
      where: { queue, eventType },
    });

    if (!distributionEvent) {
      throw new MissingException(
        `Distribution Event for queue=${queue} eventType=${eventType} not found!`,
      );
    }

    distributionEvent = await distributionEvent.update({
      metadataLabels:
        updateDistributionEventDto.metadataLabels ??
        distributionEvent.metadataLabels,
    });

    return distributionEvent;
  }

  /**
   * Removes a DistributionEvent or throws a MissingException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} eventType
   * @returns {Promise<void>}
   */
  async remove(queue: string, eventType: string) {
    const distributionEvent = await this.distributionEventModel.findOne({
      where: { queue, eventType },
    });

    if (!distributionEvent) {
      throw new MissingException(
        `Distribution Event for queue=${queue} eventType=${eventType} not found!`,
      );
    }

    await distributionEvent.destroy();
  }

  /**
   * Yields a list of objects containing the related models (DistributionRules and/or Subscriptions)
   * to be included on a DistributionEvent repository query.
   * @param {boolean} includeRules
   * @param {boolean} includeSubscriptions
   * @returns
   */
  private _buildIncludes(includeRules: boolean, includeSubscriptions: boolean) {
    const includes = [];

    if (includeRules) {
      includes.push({ model: DistributionRule });
    }

    if (includeSubscriptions) {
      includes.push({ model: Subscription, include: [SubscriptionFilter] });
    }

    return includes;
  }
}
