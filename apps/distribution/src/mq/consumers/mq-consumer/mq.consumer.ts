import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsumeMessage } from 'amqplib';
import { MqUnrecoverableError } from '../../../common/classes/mq-unrecoverable-error.class';
import { MessageDto } from '../../../common/dto/message.dto';
import { DistributionJob } from '../../../common/types/distribution-job.types';
import { MessageState } from '../../../common/types/message-state.types';
import { DistributionLogService } from '../../../resources/distribution-log/distribution-log.service';

// Note: MqConsumer is a parent class for storing commonized functionality required
//       by all consumers.

export class MqConsumer {
  protected readonly logger = new Logger(MqConsumer.name);

  constructor(
    protected readonly configService: ConfigService,
    protected readonly distributionLogService: DistributionLogService,
  ) {}

  /**
   * Yields a formatted string with the function's name in square brackets followed
   * by the RabbitMQ message id.
   * @example
   * - '[functionName] Message messageId'
   * @param {string} functionName
   * @param {string} messageId
   * @returns {string}
   */
  protected createLogPrefix(functionName: string, messageId: string): string {
    return `[${functionName}] Message ${messageId}`;
  }

  /**
   * Yields a number representing the attempts to process a message from a
   * queue.
   * @param {ConsumeMessage} amqpMsg
   * @param {string} queue 
   * @returns {number}
   */
  protected getAttempts(amqpMsg: ConsumeMessage, queue: string): number {
    const headers = amqpMsg.properties.headers;
    const queueHeader = headers['x-death']?.find(
      (header) => header.queue === queue,
    );

    return queueHeader ? queueHeader.count : 1;
  }

  protected async logAttempt(
    queue: string,
    message: MessageDto,
    attemptsMade: number,
    result: any,
    error: Error,
  ): Promise<void> {
    const state = error ? MessageState.FAILED : MessageState.COMPLETED;
    const job: DistributionJob = {
      queue,
      attemptsMade,
      processedAt: new Date(),
      finishedAt: new Date(),
      ...message,
    }

    try {
      await this.distributionLogService.log(job, state, result, error);
    } catch (err) {
      this.logger.error(
        `Failed to log message=${message.id} attempt= to database: ${err.message}`,
      );
    }
  }

  /**
   * Yields true if a message has not exceeded the max retry attempts and the error is
   * not an MqUnrecoverableError or false otherwise.
   * @param {Error} error
   * @param {ConsumeMessage} amqpMsg
   * @param {string} queue
   * @returns {boolean}
   */
  protected shouldRetry(
    error: Error,
    amqpMsg: ConsumeMessage,
    queue: string,
  ): boolean {
    return (
      !(error instanceof MqUnrecoverableError) &&
      this.getAttempts(amqpMsg, queue) <
        this.configService.get('RETRY_ATTEMPTS')
    );
  }
}
