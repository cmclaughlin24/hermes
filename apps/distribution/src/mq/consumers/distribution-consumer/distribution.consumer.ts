import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsumeMessage } from 'amqplib';
import { Queue } from 'bullmq';
import { SubscriptionFilterService } from '../../../common/providers/subscription-filter/subscription-filter.service';
import { SubscriptionMemberService } from '../../../common/providers/subscription-member/subscription-member.service';
import { DistributionRuleService } from '../../../resources/distribution-rule/distribution-rule.service';

@Injectable()
export class DistributionConsumer {
  private readonly logger = new Logger(DistributionConsumer.name);

  constructor(
    @InjectQueue(process.env.BULLMQ_NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    private readonly configService: ConfigService,
    private readonly distributionRuleService: DistributionRuleService,
    private readonly subscriptionFilterService: SubscriptionFilterService,
    private readonly subscriptionMemberService: SubscriptionMemberService,
  ) {}

  @RabbitSubscribe({
    queue: process.env.RABBITMQ_DISTRIBUTION_QUEUE,
    queueOptions: {
      // Note: If RABBITMQ_DL_EXCHANGE and RABBITMQ_DISTRIBUTION_DL_ROUTING_KEY are null/undefined,
      //       message will not be retried.
      deadLetterExchange: process.env.RABBITMQ_DL_EXCHANGE,
      deadLetterRoutingKey: process.env.RABBITMQ_DISTRIBUTION_DL_ROUTING_KEY,
    },
  })
  async subscribe(message: {}, amqpMsg: ConsumeMessage) {
    const logPrefix = this._createLogPrefix(this.subscribe.name, '');
    this.logger.log(`${logPrefix} ${JSON.stringify(message)}`);

    if (this._shouldRetry(amqpMsg)) {
      return new Nack(false);
    }
  }

  /**
   * Yields true if a message has not exceeded the max retry attempts or false
   * otherwise.
   * @param {ConsumeMessage} amqpMsg
   * @returns {boolean}
   */
  private _shouldRetry(amqpMsg: ConsumeMessage): boolean {
    const headers = amqpMsg.properties.headers;
    const queueHeader = headers['x-death']?.find(
      (header) =>
        header.queue === this.configService.get('RABBITMQ_DISTRIBUTION_QUEUE'),
    );

    return (
      !queueHeader ||
      queueHeader.count < this.configService.get('RETRY_ATTEMPTS')
    );
  }

  /**
   * Yields a formatted string with the class's name and function's name in square brackets
   * followed by the RabbitMQ message id. (e.g. [ClassName FunctionName] Message MessageId)
   * @param {string} functionName
   * @param {string} messageId
   * @returns {string}
   */
  private _createLogPrefix(functionName: string, messageId: string): string {
    return `[${DistributionConsumer.name} ${functionName}] Message ${messageId}`;
  }
}
