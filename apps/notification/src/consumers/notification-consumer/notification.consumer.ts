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

  /**
   * Processes an 'email' job from the notification queue and yields the sent email
   * notification. Throws an error if the job payload is an invalid CreateEmailNotificationDto
   * object, an email template could not be generated, or the notification fails to send.
   * @param {Job} job
   * @returns
   */
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
        // Todo: If job failed because of validation, do not retry.
        throw new Error(
          `[${NotificationConsumer.name} ${this.processEmail.name}] Job ${job.id}: Invalid payload (validation errors) ${error.message}`,
        );
      }

      job.log(
        `[${NotificationConsumer.name} ${this.processEmail.name}] Job ${job.id}: ${CreateEmailNotificationDto.name} created, building Handlebars HTML template`,
      );

      createEmailNotificationDto = await this.emailService.createEmailTemplate(
        createEmailNotificationDto,
      );

      job.log(
        `[${NotificationConsumer.name} ${this.processEmail.name}] Job ${job.id}: Handlebars HTML template created, attempting to send ${job.name} notification`,
      );

      const result = await this.emailService.sendEmail(
        createEmailNotificationDto,
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Processes a 'sms' job from the notification queue and yields the sent text
   * notification. Throws an error if the job payload is an invalid CreatePhoneNotificationDto
   * object or the notification fails to send.
   * @param {Job} job
   * @returns
   */
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
        // Todo: If job failed because of validation, do not retry.
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

  /**
   * Processes a 'radio' job from the notification queue and yields the sent text
   * notification. Throws an error if the job payload is an invalid CreateRadioNotificationDto
   * object or the notification fails to send.
   * @param {Job} job
   * @returns
   */
  @Process('radio')
  async processRadio(job: Job) {
    job.log(
      `[${NotificationConsumer.name} ${this.processRadio.name}] Job ${job.id}: Processing ${job.name} notification`,
    );
  }

  /**
   * Listens for an error event on the notification queue and logs it to
   * the console.
   * @param {Error} error
   */
  @OnQueueError()
  onQueueError(error: Error) {
    this.logger.error(error);
  }

  /**
   * Listens for a job 'completed' event on the notification queue, creates/updates a log 
   * for the job in the NotificationLog repository, and appends the 'notification_log_id'
   * to the job's payload. 
   * @param {Job} job 
   * @param {any} result 
   */
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
      await job.update({ ...job.data, notification_database_id: databaseId });
      job.log(
        `[${NotificationConsumer.name} ${this.onQueueCompleted.name}] Job ${job.id}: Result stored in database ${databaseId}`,
      );
    } catch (error) {
      job.log(
        `[${NotificationConsumer.name} ${this.onQueueCompleted.name}] Job ${job.id}: Failed to store result in database`,
      );
    }
  }

  /**
   * Listens for a job 'failed' event on the notification queue, creates/updates a log 
   * for the job in the NotificationLog repository, and appends the 'notification_log_id'
   * to the job's payload. 
   * @param {Job} job 
   * @param {any} result 
   */
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
      await job.update({ ...job.data, notification_database_id: databaseId });
      job.log(
        `[${NotificationConsumer.name} ${this.onQueueFailed.name}] Job ${job.id}: Result stored in database ${databaseId}`,
      );
    } catch (error) {
      job.log(
        `[${NotificationConsumer.name} ${this.onQueueFailed.name}] Job ${job.id}: Failed to store result in database`,
      );
    }
  }
}
