import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job, JobStatus } from 'bull';
import { NotificationLog } from './entities/notification-log.entity';

@Injectable()
export class NotificationLogService {
  private readonly logger = new Logger(NotificationLogService.name);

  constructor(
    @InjectModel(NotificationLog)
    private readonly notificationLogModel: typeof NotificationLog,
  ) {}

  async findAll(job: string[], statuses: JobStatus[]) {
    // Fixme: pass the job and status to the findAll options object.
    const notificationLogs = await this.notificationLogModel.findAll();

    if (!notificationLogs || notificationLogs.length === 0) {
      throw new NotFoundException(`Notification logs not found!`);
    }

    return notificationLogs;
  }

  async findOne(id: string) {
    const notificationLog = await this.notificationLogModel.findByPk(id);

    if (!notificationLog) {
      throw new NotFoundException(`Notification Log with ${id} not found!`);
    }

    return notificationLog;
  }

  async createOrUpdate(job: Job, status: JobStatus, result: any, error: Error) {
    this.logger.log(`Storing ${job.id} job's result in the database`);

    if (job.attemptsMade === 0 || !job.data.notification_database_id) {
      return this._createLog(job, status, result, error);
    }

    return this._updateLog(job, status, result, error);
  }

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

    log = await log.update({
      job: job.name,
      status: status,
      attempts: job.attemptsMade,
      data: job.data,
      result: result,
      error: error,
    });

    return log.id;
  }
}
