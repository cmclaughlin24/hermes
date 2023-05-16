import { ConfigService } from '@nestjs/config';
import { ConsumeMessage } from 'amqplib';
import { MqUnrecoverableError } from '../../../common/classes/mq-unrecoverable-error.class';
import { getAttempts } from '../../../common/utils/amqp.utils';

// Note: MqConsumer is a parent class for storing commonized functionality required
//       by all consumers.

export class MqConsumer {
  constructor(protected readonly configService: ConfigService) {}

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
      getAttempts(amqpMsg, queue) <
        this.configService.get('RETRY_ATTEMPTS')
    );
  }
}
