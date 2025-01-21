import { MessageState } from '../../../common/types/message-state.type';
import { DistributionJob } from '../../../common/types/distribution-job.type';
import { DistributionLog } from './entities/distribution-log.entity';

export abstract class DistributionLogRepository {
  abstract findAll(
    eventTypes: string[],
    states: string[],
  ): Promise<DistributionLog[]>;
  abstract findOne(id: string): Promise<DistributionLog>;
  abstract create(
    distributionJob: DistributionJob,
    state: MessageState,
    result: any,
    error: Record<string, any>,
  ): Promise<DistributionLog>;
  abstract update(
    distributionJob: DistributionJob,
    state: MessageState,
    result: any,
    error: Record<string, any>,
  ): Promise<DistributionLog>;
}
