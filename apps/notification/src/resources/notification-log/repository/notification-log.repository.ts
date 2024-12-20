import { Injectable } from '@nestjs/common';
import { Job, JobState } from 'bullmq';
import { NotificationLog } from '../../../infrastructure/persistance/postgres/entities/notification-log.entity';

@Injectable()
export abstract class NotificationLogRepository {
  abstract findAll(
    jobs: string[],
    states: JobState[],
  ): Promise<NotificationLog[]>;
  abstract findOne(id: string): Promise<NotificationLog>;
  abstract create(
    job: Job,
    state: JobState,
    result: any,
    error: Record<string, any>,
  ): Promise<string>;
  abstract update(
    job: Job,
    state: JobState,
    result: any,
    error: Record<string, any>,
  ): Promise<string>;
}
