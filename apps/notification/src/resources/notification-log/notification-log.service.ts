import { errorToJson } from '@hermes/common';
import { Injectable, Logger } from '@nestjs/common';
import { Job, JobState } from 'bullmq';
import * as _ from 'lodash';
import { NotificationLogRepository } from './repository/notification-log.repository';

@Injectable()
export class NotificationLogService {
  private readonly logger = new Logger(NotificationLogService.name);

  constructor(
    private readonly notificationLogRepository: NotificationLogRepository,
  ) {}

  /**
   * Yields a list of NotificationLogs filtered by the job name and/or
   * state.
   * @param {string[]} jobs
   * @param {JobState[]} states
   */
  async findAll(jobs: string[], states: JobState[]) {
    return this.notificationLogRepository.findAll(jobs, states);
  }

  /**
   * Yields a NotificationLog.
   * @param {string} id
   */
  async findOne(id: string) {
    return this.notificationLogRepository.findOne(id);
  }

  /**
   * Update a NotificationLog or create a new record if one does not exist. Will not update
   * a NotificationLog if the number of attempts in the job object are less than the number of
   * attempts stored in the NotificationLog.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Error} error
   */
  async log(job: Job, state: JobState, result: any, error: Error) {
    const errorJson = errorToJson(error);

    this.logger.log(`Storing ${job.id} job's result in the database`);

    if (!job.data.notification_database_id) {
      return this.notificationLogRepository.create(
        job,
        state,
        result,
        errorJson,
      );
    }

    return this.notificationLogRepository.update(job, state, result, errorJson);
  }
}
