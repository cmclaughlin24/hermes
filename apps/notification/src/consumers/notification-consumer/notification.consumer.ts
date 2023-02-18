import {
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { EmailService } from '../../common/providers/email/email.service';
import { PhoneService } from '../../common/providers/phone/phone.service';
import { RadioService } from '../../common/providers/radio/radio.service';
import { NotificationLogService } from '../../resources/notification-log/notification-log.service';

@Processor('notification')
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly phoneService: PhoneService,
    private readonly radioService: RadioService,
    private readonly notificationLogService: NotificationLogService,
  ) {}

  @Process('email')
  async processEmail(job: Job) {
    job.log(
      `[${NotificationConsumer.name} ${this.processEmail.name}] Job ${job.id}: Processing ${job.name} notification`,
    );

    try {
      job.log(
        `[${NotificationConsumer.name} ${this.processEmail.name}] Job ${job.id}: Creating ${CreateEmailNotificationDto.name} from payload`,
      );

      let createEmailNotificationDto: CreateEmailNotificationDto;

      try {
        // Note: Convert job payload to CreateEmailNotificationDto to validate job payload in case
        //       it is was created by an external service.
        createEmailNotificationDto =
          await this.emailService.createNotificationDto(job.data);
      } catch (error) {
        throw new Error(
          `[${NotificationConsumer.name} ${this.processEmail.name}] Job ${job.id}: Invalid payload (validation errors) ${error.message}`,
        );
      }

      job.log(
        `[${NotificationConsumer.name} ${this.processEmail.name}] Job ${job.id}: ${CreateEmailNotificationDto.name} created, attempting to send ${job.name} notification`,
      );

      const result = await this.emailService.sendEmail(
        createEmailNotificationDto,
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Process('sms')
  async processText(job: Job) {
    job.log(
      `[${NotificationConsumer.name} ${this.processText.name}] Job ${job.id}: Processing ${job.name} notification`,
    );

    try {
      job.log(
        `[${NotificationConsumer.name} ${this.processText.name}] Job ${job.id}: Creating ${CreatePhoneNotificationDto.name} from payload`,
      );

      let createPhoneNotificationDto: CreatePhoneNotificationDto;

      try {
        createPhoneNotificationDto =
          await this.phoneService.createNotificationDto(job.data);
      } catch (error) {
        throw new Error(
          `[${NotificationConsumer.name} ${this.processText.name}] Job ${job.id}: Invalid payload (validation errors) ${error.message}`,
        );
      }

      job.log(
        `[${NotificationConsumer.name} ${this.processText.name}] Job ${job.id}: ${CreatePhoneNotificationDto.name} created, attempting to send ${job.name} notification`,
      );

      const result = await this.phoneService.sendText(
        createPhoneNotificationDto,
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Process('radio')
  async processRadio(job: Job) {
    job.log(
      `[${NotificationConsumer.name} ${this.processRadio.name}] Job ${job.id}: Processing ${job.name} notification`,
    );
  }

  @OnQueueError()
  onQueueError(error: Error) {
    this.logger.error(error);
  }

  @OnQueueCompleted()
  async onQueueCompleted(job: Job, result: any) {
    job.log(
      `[${NotificationConsumer.name} ${this.onQueueCompleted.name}] Job ${job.id}: ${job.name} notification completed`,
    );

    try {
      const databaseId = await this.notificationLogService.createOrUpdate(
        job,
        'completed',
        result,
        null,
      );
      job.log(
        `[${NotificationConsumer.name} ${this.onQueueCompleted.name}] Job ${job.id}: Result stored in database ${databaseId}`,
      );
    } catch (error) {
      job.log(
        `[${NotificationConsumer.name} ${this.onQueueCompleted.name}] Job ${job.id}: Failed to store result in database`,
      );
    }
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job, error: Error) {
    job.log(
      `[${NotificationConsumer.name} ${this.onQueueFailed.name}] Job ${job.id}: ${job.name} notification failed on attempt ${job.attemptsMade}`,
    );

    try {
      const databaseId = await this.notificationLogService.createOrUpdate(
        job,
        'failed',
        null,
        error,
      );
      job.log(
        `[${NotificationConsumer.name} ${this.onQueueCompleted.name}] Job ${job.id}: Result stored in database ${databaseId}`,
      );
    } catch (error) {
      job.log(
        `[${NotificationConsumer.name} ${this.onQueueCompleted.name}] Job ${job.id}: Failed to store result in database`,
      );
    }
  }
}
