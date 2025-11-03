import { Injectable } from '@nestjs/common';
import { CreateDistributionEventDto } from '../dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from '../dto/update-distribution-event.dto';
import { DistributionEventEntity } from './entities/distribution-event.entity';

@Injectable()
export abstract class DistributionEventRepository {
  abstract findAll(
    includeRules?: boolean,
    includeSubscriptions?: boolean,
  ): Promise<DistributionEventEntity[]>;
  abstract findOne(
    eventType: string,
    includeRules: boolean,
    includeSubscriptions: boolean,
  ): Promise<DistributionEventEntity>;
  abstract create(
    createDistributionEventDto: CreateDistributionEventDto,
  ): Promise<DistributionEventEntity>;
  abstract update(
    eventType: string,
    updateDistributionEventDto: UpdateDistributionEventDto,
  ): Promise<DistributionEventEntity>;
  abstract remove(eventType: string): Promise<void>;
}
