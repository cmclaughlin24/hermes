import { errorToJson } from '@hermes/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, JobState } from 'bullmq';
import * as _ from 'lodash';
import { DataSource, In, Repository } from 'typeorm';
import { NotificationAttempt } from './entities/notification-attempt.entity';
import { NotificationLog } from './entities/notification-log.entity';

@Injectable()
export class NotificationLogService {
  private readonly logger = new Logger(NotificationLogService.name);

  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
    @InjectRepository(NotificationAttempt)
    private readonly notificationAttemptRepository: Repository<NotificationAttempt>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Yields a list of NotificationLogs filtered by the job name and/or
   * state.
   * @param {string[]} jobs
   * @param {JobState[]} states
   * @returns {Promise<NotificationLog[]>}
   */
  async findAll(jobs: string[], states: JobState[]) {
    return this.notificationLogRepository.find({
      where: this._buildWhereClause(jobs, states),
      relations: { attemptHistory: true },
    });
  }

  /**
   * Yields a NotificationLog.
   * @param {string} id
   * @returns {Promise<NotificationLog>}
   */
  async findOne(id: string) {
    return this.notificationLogRepository.findOne({
      where: { id },
      relations: { attemptHistory: true },
    });
  }

  /**
   * Update a NotificationLog or create a new record if one does not exist. Will not update
   * a NotificationLog if the number of attempts in the job object are less than the number of
   * attempts stored in the NotificationLog.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  async log(job: Job, state: JobState, result: any, error: Error) {
    const errorJson = errorToJson(error);

    this.logger.log(`Storing ${job.id} job's result in the database`);

    if (!job.data.notification_database_id) {
      return this._createLog(job, state, result, errorJson);
    }

    return this._updateLog(job, state, result, errorJson);
  }

  /**
   * Yields an object containing key-value pairs with the filter(s) (queues and/or
   * states) that should be applied on a NotificationLog repository query.
   * @param {string[]} jobs
   * @param {string[]} states
   * @returns
   */
  private _buildWhereClause(jobs: string[], states: string[]) {
    const where: any = {};

    if (!_.isEmpty(jobs)) {
      where.job = In(jobs);
    }

    if (!_.isEmpty(states)) {
      where.state = In(states);
    }

    return Object.keys(where).length > 0 ? where : null;
  }

  /**
   * Creates a NotificationLog.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Record<string, any>} error
   * @returns {Promise<string>}
   */
  private async _createLog(
    job: Job,
    state: JobState,
    result: any,
    error: Record<string, any>,
  ) {
    const attempts =
      state === 'completed' || state === 'failed'
        ? [
            this.notificationAttemptRepository.create({
              attempt: job.attemptsMade,
              processedAt: new Date(job.processedOn),
              result: result,
              error: error,
            }),
          ]
        : [];
    const log = this.notificationLogRepository.create({
      job: job.name,
      state: state,
      attempts: job.attemptsMade,
      data: job.data,
      addedAt: new Date(job.timestamp),
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      attemptHistory: attempts,
    });

    return this.notificationLogRepository.save(log).then((l) => l.id);
  }

  /**
   * Updates a NotificationLog if the number of attempts in job is greater than
   * the number of attempts in the record.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Record<string, any>} error
   * @returns {Promise<string>}
   */
  private async _updateLog(
    job: Job,
    state: JobState,
    result: any,
    error: Record<string, any>,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Note: Remove the database id from the job's data before updating the record.
      const data = { ...job.data };
      delete data.notification_database_id;

      const log = await this.notificationLogRepository.preload({
        id: job.data.notification_database_id,
        state: state,
        attempts: job.attemptsMade,
        data: data,
        finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      });

      // Note: A NotificationAttempt entry should only be created for completed/failed JobStates.
      if (state === 'completed' || state === 'failed') {
        const attempt = await this.notificationAttemptRepository.create({
          attempt: job.attemptsMade,
          processedAt: new Date(job.processedOn),
          result: result,
          error: error,
          log,
        });

        await this.notificationAttemptRepository.save(attempt);
      }

      return this.notificationLogRepository.save(log).then(async (l) => {
        await queryRunner.commitTransaction();
        return l.id;
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
