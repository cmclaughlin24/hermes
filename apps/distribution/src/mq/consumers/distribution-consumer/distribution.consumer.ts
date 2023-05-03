import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsumeMessage } from 'amqplib';
import { Queue } from 'bullmq';
import * as _ from 'lodash';
import { MessageDto } from '../../../common/dto/message.dto';
import { SubscriptionMemberService } from '../../../common/providers/subscription-member/subscription-member.service';
import { createNotificationJobs } from '../../../common/utils/notification-job.utils';
import { filterSubscriptions } from '../../../common/utils/subscription-filter.utils';
import { DistributionRuleService } from '../../../resources/distribution-rule/distribution-rule.service';

@Injectable()
export class DistributionConsumer {
  private readonly logger = new Logger(DistributionConsumer.name);

  constructor(
    @InjectQueue(process.env.BULLMQ_NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    private readonly configService: ConfigService,
    private readonly distributionRuleService: DistributionRuleService,
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
  async subscribe(message: MessageDto, amqpMsg: ConsumeMessage) {
    const logPrefix = this._createLogPrefix(this.subscribe.name, message.type);

    try {
      const distributionRule = await this.distributionRuleService.findOne(
        this.configService.get('RABBITMQ_DISTRIBUTION_QUEUE'),
        message.type,
        true,
      );

      const subscriptions = filterSubscriptions(
        distributionRule.subscriptions,
        message.payload,
      );

      if (_.isEmpty(subscriptions)) {
        return;
      }

      const subscriptionMembers = await this.subscriptionMemberService.get(
        distributionRule.subscriptions,
      );

      if (_.isEmpty(subscriptionMembers)) {
        return;
      }

      const jobs = createNotificationJobs(
        distributionRule,
        subscriptionMembers,
        message.payload,
      );

      if (_.isEmpty(jobs)) {
        return;
      }

      await this.notificationQueue.addBulk(jobs);
    } catch (error) {
      if (this._shouldRetry(amqpMsg)) {
        return new Nack();
      }
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
