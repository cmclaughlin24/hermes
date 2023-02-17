import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JobStatus, Queue } from 'bull';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreateRadioNotificationDto } from '../../common/dto/create-radio-notification.dto';
import { queuePool } from '../../config/bull-board.config';

type NotificationDto =
  | CreateEmailNotificationDto
  | CreatePhoneNotificationDto
  | CreateRadioNotificationDto;

@Injectable()
export class NotificationJobService {
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {
    // Note: Add NotificationQueue to Bull Board.
    queuePool.add(notificationQueue);
  }

  async findOne(id: number) {
    const job = await this.notificationQueue.getJob(id);

    if (!job) {
      throw new NotFoundException(
        `Job with ${id} not found in '${this.notificationQueue.name}' queue`,
      );
    }

    return job;
  }

  async findAll(statuses: JobStatus[]) {
    const jobs = await this.notificationQueue.getJobs(statuses);

    if (!jobs || jobs.length === 0) {
      throw new NotFoundException(`Jobs with status(es) ${statuses.join(', ')} not found`);
    }

    return jobs;
  }

  async createEmailNotification(
    createEmailNotificationDto: CreateEmailNotificationDto,
  ) {
    return this._createNotification('email', createEmailNotificationDto);
  }

  async createTextNotification(
    createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    return this._createNotification('sms', createPhoneNotificationDto);
  }

  async createRadioNotification(
    createRadioNotification: CreateRadioNotificationDto,
  ) {
    return this._createNotification('radio', createRadioNotification);
  }

  private async _createNotification(
    name: string,
    notificationDto: NotificationDto,
  ) {
    const job = await this.notificationQueue.add(name, notificationDto);

    return new ApiResponseDto(
      `Successfully scheduled ${name} notification`,
      job,
    );
  }
}
