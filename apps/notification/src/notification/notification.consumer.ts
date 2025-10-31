import { DeliveryMethods } from '@hermes/common';
import { OTelCounter, OTelSpan, OpenTelemetry } from '@hermes/open-telemetry';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { SpanKind } from '@opentelemetry/api';
import { Job, KeepJobs, UnrecoverableError } from 'bullmq';
import { BullMQOtel } from 'bullmq-otel';
import { NotificationLogService } from '../notification-log/notification-log.service';
import { NotifierStrategyService } from './notifier-strategy.service';
import { NotifierStrategyException } from './errors/notifier-strategy.error';
import { DtoValidationException } from '../common/errors/dto-validation.error';

const KEEP_JOB_OPTIONS: KeepJobs = {
  age: +process.env.BULLMQ_NOTIFICATION_JOB_AGE,
};
const BULLMQ_CONCURRENCY = +process.env.BULLMQ_CONCURRENCY;

@Processor(process.env.BULLMQ_NOTIFICATION_QUEUE, {
  removeOnComplete: KEEP_JOB_OPTIONS,
  removeOnFail: KEEP_JOB_OPTIONS,
  concurrency: BULLMQ_CONCURRENCY,
  telemetry: new BullMQOtel(process.env.BULLMQ_NOTIFICATION_QUEUE),
})
@OpenTelemetry()
export class NotificationConsumer extends WorkerHost {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly notificationLogService: NotificationLogService,
    private readonly notifierStrategies: NotifierStrategyService,
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
  @OTelCounter({
    meterName: 'hermes.notification.service.notification-consumer',
    counterName: 'total-notifications.counter',
    attrFn: (args) => ({ 'notification.type': args[0].name }),
  })
  @OTelSpan({ kind: SpanKind.CONSUMER, root: true })
  async process(job: Job): Promise<any> {
    const logPrefix = this._createLogPrefix(this.process.name, job.id);

    try {
      job.log(`${logPrefix}: Processing ${job.name} notification`);

      const strategy = this.notifierStrategies.get(job.name as DeliveryMethods);

      job.log(`${logPrefix}: Creating DTO from payload`);

      let dto = await strategy.createNotificationDto(job.data);

      job.log(`${logPrefix}: DTO created, building message template`);

      dto = await strategy.createTemplate(dto);

      job.log(
        `${logPrefix}: Message template created, attempting to send ${job.name} notification`,
      );

      const result = await strategy.notify(dto);

      return result;
    } catch (error) {
      if (error instanceof NotifierStrategyException) {
        throw new UnrecoverableError(
          `Invalid Delivery Method: ${job.name} is not an available delievery method`,
        );
      } else if (error instanceof DtoValidationException) {
        throw new UnrecoverableError(
          `Invalid payload (validation errors) ${error.message}`,
        );
      }

      throw error;
    }
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
  @OTelSpan({ root: true })
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
      await job.updateData({
        ...job.data,
        notification_database_id: databaseId,
      });
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
  @OTelCounter({
    meterName: 'hermes.notification.service.notification-consumer',
    counterName: 'failed-notifications.counter',
    attrFn: (args) => ({ 'notification.type': args[0].name }),
  })
  @OTelSpan({ root: true })
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
      await job.updateData({
        ...job.data,
        notification_database_id: databaseId,
      });
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
