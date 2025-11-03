import { Injectable } from '@nestjs/common';
import { DistributionJob } from '../../common/types/distribution-job.type';
import { MessageState } from '../../common/types/message-state.type';
import { DistributionLogEntity } from './entities/distribution-log.entity';

@Injectable()
export abstract class DistributionLogRepository {
  abstract findAll(
    eventTypes: string[],
    states: string[],
  ): Promise<DistributionLogEntity[]>;
  abstract findOne(id: string): Promise<DistributionLogEntity>;
  abstract create(
    distributionJob: DistributionJob,
    state: MessageState,
    result: any,
    error: Record<string, any>,
  ): Promise<DistributionLogEntity>;
  abstract update(
    distributionJob: DistributionJob,
    state: MessageState,
    result: any,
    error: Record<string, any>,
  ): Promise<DistributionLogEntity>;
}
