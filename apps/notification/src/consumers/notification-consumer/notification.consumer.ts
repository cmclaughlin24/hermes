import {
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { DeliveryMethods, NotificationQueues } from '@notification/common';
import { Job, JobId } from 'bull';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { EmailService } from '../../common/providers/email/email.service';
import { PhoneService } from '../../common/providers/phone/phone.service';
import { RadioService } from '../../common/providers/radio/radio.service';
import { NotificationLogService } from '../../resources/notification-log/notification-log.service';

@Processor(NotificationQueues.DEFAULT)
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
  @Process(DeliveryMethods.EMAIL)
  async processEmail(job: Job) {
    const logPrefix = this._createLogPrefix(this.processEmail.name, job.id);

    job.log(`${logPrefix}: Processing ${job.name} notification`);

    try {
      job.log(
        `${logPrefix}: Creating ${CreateEmailNotificationDto.name} from payload`,
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
          `${logPrefix}: Invalid payload (validation errors) ${error.message}`,
        );
      }

      job.log(
        `${logPrefix}: ${CreateEmailNotificationDto.name} created, building Handlebars HTML template`,
      );

      createEmailNotificationDto = await this.emailService.createEmailTemplate(
        createEmailNotificationDto,
      );

      job.log(
        `${logPrefix}: Handlebars HTML template created, attempting to send ${job.name} notification`,
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
  @Process(DeliveryMethods.SMS)
  async processText(job: Job) {
    const logPrefix = this._createLogPrefix(this.processText.name, job.id);

    job.log(`${logPrefix}: Processing ${job.name} notification`);

    try {
      job.log(
        `${logPrefix}: Creating ${CreatePhoneNotificationDto.name} from payload`,
      );

      let createPhoneNotificationDto: CreatePhoneNotificationDto;

      try {
        createPhoneNotificationDto =
          await this.phoneService.createNotificationDto(job.data);
      } catch (error) {
        // Todo: If job failed because of validation, do not retry.
        throw new Error(
          `${logPrefix}: Invalid payload (validation errors) ${error.message}`,
        );
      }

      job.log(
        `${logPrefix}: ${CreatePhoneNotificationDto.name} created, attempting to send ${job.name} notification`,
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
  @Process(DeliveryMethods.RADIO)
  async processRadio(job: Job) {
    const logPrefix = this._createLogPrefix(this.processRadio.name, job.id);

    job.log(`${logPrefix}: Processing ${job.name} notification`);
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
    const logPrefix = this._createLogPrefix(this.onQueueCompleted.name, job.id);

    job.log(`${logPrefix}: ${job.name} notification completed`);

    try {
      const databaseId = await this.notificationLogService.createOrUpdate(
        job,
        'completed',
        result,
        null,
      );
      await job.update({ ...job.data, notification_database_id: databaseId });
      job.log(`${logPrefix}: Result stored in database ${databaseId}`);
    } catch (error) {
      job.log(`${logPrefix}: Failed to store result in database`);
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
    const logPrefix = this._createLogPrefix(this.onQueueFailed.name, job.id);

    job.log(
      `${logPrefix}: ${job.name} notification failed on attempt ${job.attemptsMade}`,
    );

    try {
      const databaseId = await this.notificationLogService.createOrUpdate(
        job,
        'failed',
        null,
        error,
      );
      await job.update({ ...job.data, notification_database_id: databaseId });
      job.log(`${logPrefix}: Result stored in database ${databaseId}`);
    } catch (error) {
      job.log(`${logPrefix}: Failed to store result in database`);
    }
  }

  /**
   * Yields a formatted string with the class's name and function's name in square brackets
   * followed by the Bull job id. (e.g. [ClassName FunctionName] Job JobId)
   * @param {string} functionName
   * @param {JobId} jobId
   * @returns {string}
   */
  private _createLogPrefix(functionName: string, jobId: JobId): string {
    return `[${NotificationConsumer.name} ${functionName}] Job ${jobId}`;
  }
}
