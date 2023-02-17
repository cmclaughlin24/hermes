import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JobStatus } from 'bull';
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

  async createOrUpdate(name: string) {
    this.logger.log(`Storing ${name} job's result in the database`);
    return 'PLACEHOLDER_DATABASE_ID';
  }
}
