import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job, JobStatus } from 'bull';
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
   * status. Throws a NotFoundException if the repository returns null,
   * undefined, or an empty list.
   * @param {string[]} jobs
   * @param {JobStatus[]} statuses
   * @returns {Promise<NotificationLog[]>}
   */
  async findAll(jobs: string[], statuses: JobStatus[]) {
    const notificationLogs = await this.notificationLogModel.findAll({
      where: { status: statuses, job: jobs },
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
   * @param {JobStatus} status
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  async createOrUpdate(job: Job, status: JobStatus, result: any, error: Error) {
    this.logger.log(`Storing ${job.id} job's result in the database`);

    if (!job.data.notification_database_id) {
      return this._createLog(job, status, result, error);
    }

    return this._updateLog(job, status, result, error);
  }

  /**
   * Creates a NotificationLog.
   * @param {Job} job
   * @param {JobStatus} status
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  private async _createLog(
    job: Job,
    status: JobStatus,
    result: any,
    error: Error,
  ) {
    const log = await this.notificationLogModel.create({
      job: job.name,
      status: status,
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
   * @param {JobStatus} status
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  private async _updateLog(
    job: Job,
    status: JobStatus,
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
      status: status,
      attempts: job.attemptsMade,
      data: data,
      result: result,
      error: error,
    });

    return log.id;
  }
}
