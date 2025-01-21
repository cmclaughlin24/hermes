import { CreateDistributionEventDto } from '../dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from '../dto/update-distribution-event.dto';
import { DistributionEvent } from './entities/distribution-event.entity';

export abstract class DistributionEventRepository {
  abstract findAll(
    includeRules?: boolean,
    includeSubscriptions?: boolean,
  ): Promise<DistributionEvent[]>;
  abstract findOne(
    eventType: string,
    includeRules: boolean,
    includeSubscriptions: boolean,
  ): Promise<DistributionEvent>;
  abstract create(
    createDistributionEventDto: CreateDistributionEventDto,
  ): Promise<DistributionEvent>;
  abstract update(
    eventType: string,
    updateDistributionEventDto: UpdateDistributionEventDto,
  ): Promise<DistributionEvent>;
  abstract remove(eventType: string): Promise<void>;
}
