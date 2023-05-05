import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job, JobState } from 'bullmq';
import * as _ from 'lodash';
import { NotificationLog } from './entities/notification-log.entity';

@Injectable()
export class NotificationLogService {
  private readonly logger = new Logger(NotificationLogService.name);

  constructor(
    @InjectModel(NotificationLog)
    private readonly notificationLogModel: typeof NotificationLog,
  ) {}

  /**
   * Yields a list of NotificationLogs filtered by the job name and/or
   * state. Throws a NotFoundException if the repository returns null,
   * undefined, or an empty list.
   * @param {string[]} jobs
   * @param {JobState[]} states
   * @returns {Promise<NotificationLog[]>}
   */
  async findAll(jobs: string[], states: JobState[]) {
    const notificationLogs = await this.notificationLogModel.findAll({
      where: { state: states, job: jobs },
    });

    if (_.isEmpty(notificationLogs)) {
      throw new NotFoundException(`Notification logs not found!`);
    }

    return notificationLogs;
  }

  /**
   * Yields a NotificationLog or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} id
   * @returns {Promise<NotificationLog>}
   */
  async findOne(id: string) {
    const notificationLog = await this.notificationLogModel.findByPk(id);

    if (!notificationLog) {
      throw new NotFoundException(`Notification Log with ${id} not found!`);
    }

    return notificationLog;
  }

  /**
   * Update a NotificationLog or create a new record if one does not exits. Will not update
   * a NotificationLog if the number of attempts in the job object are less than the number of
   * attempts stored in the NotificationLog.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  async log(job: Job, state: JobState, result: any, error: Error) {
    this.logger.log(`Storing ${job.id} job's result in the database`);

    // Fixme: Convert Error object to JSON object so that it may be stored in the database.
    if (!job.data.notification_database_id) {
      return this._createLog(job, state, result, error);
    }

    return this._updateLog(job, state, result, error);
  }

  /**
   * Creates a NotificationLog.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  private async _createLog(
    job: Job,
    state: JobState,
    result: any,
    error: Error,
  ) {
    const log = await this.notificationLogModel.create({
      job: job.name,
      state: state,
      attempts: job.attemptsMade,
      data: job.data,
      result: result,
      error: error,
    });

    return log.id;
  }

  /**
   * Updates a NotificationLog if the number of attempts in job is greater than
   * the number of attempts in the record.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  private async _updateLog(
    job: Job,
    state: JobState,
    result: any,
    error: Error,
  ) {
    let log = await this.notificationLogModel.findByPk(
      job.data.notification_database_id,
    );

    if (log.attempts > job.attemptsMade) {
      this.logger.warn(
        `[${this._updateLog.name}] Notification Log attempts (${log.attempts}) greater than job attemps (${job.attemptsMade}), no update`,
      );
      return log.id;
    }

    // Note: Remove the database id from the job's data before updating the record.
    const data = { ...job.data };
    delete data.notification_database_id;

    log = await log.update({
      job: job.name,
      state: state,
      attempts: job.attemptsMade,
      data: data,
      result: result,
      error: error,
    });

    return log.id;
  }
}
