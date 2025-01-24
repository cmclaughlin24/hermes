import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DistributionEvent } from './entities/distribution-event.entity';
import { DistributionEventRepository } from './distribution-event.repository';
import { CreateDistributionEventDto } from '../dto/create-distribution-event.dto';
import { ExistsException, MissingException } from '@hermes/common';
import { UpdateDistributionEventDto } from '../dto/update-distribution-event.dto';
import { DistributionRule } from '../../distribution-rule/repository/entities/distribution-rule.entity';
import { SubscriptionFilter } from '../../subscription/repository/entities/subscription-filter.entity';
import { Subscription } from '../../subscription/repository/entities/subscription.entity';

@Injectable()
export class OrmDistributionEventRepository
  implements DistributionEventRepository
{
  constructor(
    @InjectModel(DistributionEvent)
    private readonly distributionEventModel: typeof DistributionEvent,
  ) {}

  async findAll(includeRules: boolean, includeSubscriptions: boolean) {
    return this.distributionEventModel.findAll({
      include: this._buildIncludes(includeRules, includeSubscriptions),
    });
  }

  async findOne(
    eventType: string,
    includeRules: boolean = false,
    includeSubscriptions: boolean = false,
  ) {
    return this.distributionEventModel.findByPk(eventType, {
      include: this._buildIncludes(includeRules, includeSubscriptions),
    });
  }

  async create(createDistributionEventDto: CreateDistributionEventDto) {
    const existingEvent = await this.distributionEventModel.findByPk(
      createDistributionEventDto.eventType,
    );

    if (existingEvent) {
      throw new ExistsException(
        `Distribution Event for eventType=${createDistributionEventDto.eventType} already exists!`,
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

  async update(
    eventType: string,
    updateDistributionEventDto: UpdateDistributionEventDto,
  ) {
    let distributionEvent =
      await this.distributionEventModel.findByPk(eventType);

    if (!distributionEvent) {
      throw new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
    }

    distributionEvent = await distributionEvent.update({
      metadataLabels:
        updateDistributionEventDto.metadataLabels ??
        distributionEvent.metadataLabels,
    });

    return distributionEvent;
  }

  async remove(eventType: string) {
    const distributionEvent =
      await this.distributionEventModel.findByPk(eventType);

    if (!distributionEvent) {
      throw new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
    }

    await distributionEvent.destroy();
  }

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
