import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { DeliveryMethods } from '@notification/common';
import { Job, KeepJobs, UnrecoverableError } from 'bullmq';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { EmailService } from '../../common/providers/email/email.service';
import { PhoneService } from '../../common/providers/phone/phone.service';
import { RadioService } from '../../common/providers/radio/radio.service';
import { compileTextTemplate } from '../../common/utils/template.utils';
import { NotificationLogService } from '../../resources/notification-log/notification-log.service';

const KEEP_JOB_OPTIONS: KeepJobs = {
  age: +process.env.BULLMQ_NOTIFICATION_JOB_AGE,
};

@Processor(process.env.BULLMQ_NOTIFICATION_QUEUE, {
  removeOnComplete: KEEP_JOB_OPTIONS,
  removeOnFail: KEEP_JOB_OPTIONS,
})
export class NotificationConsumer extends WorkerHost {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly phoneService: PhoneService,
    private readonly radioService: RadioService,
    private readonly notificationLogService: NotificationLogService,
  ) {
    super();
  }

  /**
   * Routes jobs from the notification queue by checking the job's name and
   * executing the correct process function. Throws an unrecoverable error if
   * a job name does not have a process function.
   * @param {Job} job
   * @returns {Promise<any>}
   */
  async process(job: Job): Promise<any> {
    let result;

    switch (job.name) {
      case DeliveryMethods.EMAIL:
        result = await this.processEmail(job);
        break;
      case DeliveryMethods.SMS:
        result = await this.processText(job);
        break;
      case DeliveryMethods.RADIO:
        result = await this.processRadio(job);
        break;
      default:
        throw new UnrecoverableError(
          `Invalid Delivery Method: ${job.name} is not an available delievery method`,
        );
    }

    return result;
  }

  /**
   * Processes an 'email' job from the notification queue and yields the sent email
   * notification. Throws an error if the job payload is an invalid CreateEmailNotificationDto
   * object, an email template could not be generated, or the notification fails to send.
   * @param {Job} job
   * @returns
   */
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
        throw new UnrecoverableError(
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
        throw new UnrecoverableError(
          `${logPrefix}: Invalid payload (validation errors) ${error.message}`,
        );
      }

      job.log(
        `${logPrefix}: ${CreatePhoneNotificationDto.name} created, building message template`,
      );

      createPhoneNotificationDto.body = compileTextTemplate(
        createPhoneNotificationDto.body,
        createPhoneNotificationDto.context,
      );

      job.log(
        `${logPrefix}: Message template created, attempting to send ${job.name} notification`,
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
  async processRadio(job: Job) {
    const logPrefix = this._createLogPrefix(this.processRadio.name, job.id);

    job.log(`${logPrefix}: Processing ${job.name} notification`);
  }

  /**
   * Listens for an error event on the notification queue and logs it to
   * the console.
   * @param {Error} error
   */
  @OnWorkerEvent('error')
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
  @OnWorkerEvent('completed')
  async onQueueCompleted(job: Job, result: any) {
    const logPrefix = this._createLogPrefix(this.onQueueCompleted.name, job.id);

    job.log(`${logPrefix}: ${job.name} notification completed`);

    try {
      const databaseId = await this.notificationLogService.log(
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
  @OnWorkerEvent('failed')
  async onQueueFailed(job: Job, error: Error) {
    const logPrefix = this._createLogPrefix(this.onQueueFailed.name, job.id);

    job.log(
      `${logPrefix}: ${job.name} notification failed on attempt ${job.attemptsMade}`,
    );

    try {
      const databaseId = await this.notificationLogService.log(
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
  private _createLogPrefix(functionName: string, jobId: any): string {
    return `[${NotificationConsumer.name} ${functionName}] Job ${jobId}`;
  }
}
