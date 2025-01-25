import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionEvent } from './entities/distribution-event.entity';
import { DistributionEventRepository } from './distribution-event.repository';
import { CreateDistributionEventDto } from '../dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from '../dto/update-distribution-event.dto';
import { DistributionRule } from '../../distribution-rule/repository/entities/distribution-rule.entity';

@Injectable()
export class OrmDistributionEventRepository
  implements DistributionEventRepository
{
  constructor(
    @InjectRepository(DistributionEvent)
    private readonly distributionEventModel: Repository<DistributionEvent>,
    @InjectRepository(DistributionRule)
    private readonly distributionRuleModel: Repository<DistributionRule>,
  ) {}

  async findAll(includeRules: boolean, includeSubscriptions: boolean) {
    return this.distributionEventModel.find({
      relations: { rules: includeRules, subscriptions: includeSubscriptions },
    });
  }

  async findOne(
    eventType: string,
    includeRules: boolean = false,
    includeSubscriptions: boolean = false,
  ) {
    return this.distributionEventModel.findOne({
      where: { eventType },
      relations: { rules: includeRules, subscriptions: includeSubscriptions },
    });
  }

  async create(createDistributionEventDto: CreateDistributionEventDto) {
    const rules =
      createDistributionEventDto.rules?.map((rule) =>
        this.distributionRuleModel.create(rule),
      ) ?? [];

    const event = this.distributionEventModel.create({
      ...createDistributionEventDto,
      rules,
    });

    return this.distributionEventModel.save(event).catch((error) => {
      console.log(error);
      if (error.code === PostgresError.UNIQUE_VIOLATION) {
        throw new ExistsException(
          `Distribution Event for eventType=${createDistributionEventDto.eventType} already exists!`,
        );
      }
      throw error;
    });
  }

  async update(
    eventType: string,
    updateDistributionEventDto: UpdateDistributionEventDto,
  ) {
    const event = await this.distributionEventModel.findOneBy({ eventType });

    if (!event) {
      throw new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
    }

    event.metadataLabels =
      updateDistributionEventDto.metadataLabels ?? event.metadataLabels;

    return this.distributionEventModel.save(event);
  }

  async remove(eventType: string) {
    const event = await this.distributionEventModel.findOneBy({
      eventType,
    });

    if (!event) {
      throw new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
    }

    await this.distributionEventModel.remove(event);
  }
}
