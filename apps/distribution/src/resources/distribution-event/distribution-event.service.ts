import { ApiResponseDto } from '@hermes/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { DistributionRule } from '../distribution-rule/entities/distribution-rule.entity';
import { SubscriptionFilter } from '../subscription/entities/subscription-filter.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './entities/distribution-event.entity';

@Injectable()
export class DistributionEventService {
  constructor(
    @InjectModel(DistributionEvent)
    private readonly distributionEventModel: typeof DistributionEvent,
  ) {}

  /**
   * Yields a list of DistributionEvents or throws a NotFoundException if the
   * repository return null, undefined, or an empty list.
   * @param {boolean} includeRules
   * @param {boolean} includeSubscriptions
   * @returns {Promise<DistributionEvent[]>}
   */
  async findAll(includeRules: boolean, includeSubscriptions: boolean) {
    const distributionEvents = await this.distributionEventModel.findAll({
      include: this._buildIncludes(includeRules, includeSubscriptions),
    });

    if (_.isEmpty(distributionEvents)) {
      throw new NotFoundException('Distribution events not found!');
    }

    return distributionEvents;
  }

  /**
   * Yields a DistributionEvent or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} messageType
   * @param {boolean} includeRules
   * @param {boolean} includeSubscriptions
   * @returns {Promise<DistributionEvent>}
   */
  async findOne(
    queue: string,
    messageType: string,
    includeRules: boolean = false,
    includeSubscriptions: boolean = false,
  ) {
    const distributionEvent = await this.distributionEventModel.findOne({
      where: { queue, messageType },
      include: this._buildIncludes(includeRules, includeSubscriptions),
    });

    if (!distributionEvent) {
      throw new NotFoundException(
        `Distribution Event for queue=${queue} messageType=${messageType} not found!`,
      );
    }

    return distributionEvent;
  }

  /**
   * Creates a DistributionEvent of throws a BadRequestException if a distribution event
   * for a queue and messageType exists in the repository.
   * @param {CreateDistributionEventDto} createDistributionEventDto
   * @returns {Promise<ApiResponseDto<DistributionEvent>>}
   */
  async create(createDistributionEventDto: CreateDistributionEventDto) {
    const existingEvent = await this.distributionEventModel.findOne({
      where: {
        queue: createDistributionEventDto.queue,
        messageType: createDistributionEventDto.messageType,
      },
    });

    if (existingEvent) {
      throw new BadRequestException(
        `Distribution Event for queue=${createDistributionEventDto.queue} messageType=${createDistributionEventDto.messageType} already exists!`,
      );
    }

    const distributionEvent = await this.distributionEventModel.create(
      {
        ...createDistributionEventDto,
      },
      { include: [DistributionRule] },
    );

    return new ApiResponseDto<DistributionEvent>(
      `Successfully created distribution rule for queue=${distributionEvent.queue} messageType=${distributionEvent.messageType}!`,
      distributionEvent,
    );
  }

  /**
   * Updates a DistributionEvent or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} messageType
   * @param {UpdateDistributionEventDto} updateDistributionEventDto
   * @returns {Promise<ApiResponseDto<DistributionEvent>>}
   */
  async update(
    queue: string,
    messageType: string,
    updateDistributionEventDto: UpdateDistributionEventDto,
  ) {
    let distributionEvent = await this.distributionEventModel.findOne({
      where: { queue, messageType },
    });

    if (!distributionEvent) {
      throw new NotFoundException(
        `Distribution Event for queue=${queue} messageType=${messageType} not found!`,
      );
    }

    distributionEvent = await distributionEvent.update({
      metadataLabels:
        updateDistributionEventDto.metadataLabels ??
        distributionEvent.metadataLabels,
    });

    return new ApiResponseDto<DistributionEvent>(
      `Successfully updated distribution event for queue=${queue} messageType=${messageType}!`,
      distributionEvent,
    );
  }

  /**
   * Removes a DistributionEvent or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} messageType
   * @returns {Promise<ApiResponseDto>}
   */
  async remove(queue: string, messageType: string) {
    const distributionEvent = await this.distributionEventModel.findOne({
      where: { queue, messageType },
    });

    if (!distributionEvent) {
      throw new NotFoundException(
        `Distribution Event for queue=${queue} messageType=${messageType} not found!`,
      );
    }

    await distributionEvent.destroy();

    return new ApiResponseDto(
      `Successfully deleted distribution event for queue=${queue} messageType=${messageType}!`,
    );
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
