import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hasMetadata } from '@notification/common';
import { ConsumeMessage } from 'amqplib';
import { DistributionEventService } from 'apps/distribution/src/resources/distribution-event/distribution-event.service';
import { Queue } from 'bullmq';
import * as _ from 'lodash';
import { MessageDto } from '../../../common/dto/message.dto';
import { SubscriptionMemberService } from '../../../common/providers/subscription-member/subscription-member.service';
import { createNotificationJobs } from '../../../common/utils/notification-job.utils';
import { filterSubscriptions } from '../../../common/utils/subscription-filter.utils';
import { DistributionEvent } from '../../../resources/distribution-event/entities/distribution-event.entity';

@Injectable()
export class DistributionConsumer {
  private readonly logger = new Logger(DistributionConsumer.name);

  constructor(
    @InjectQueue(process.env.BULLMQ_NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    private readonly configService: ConfigService,
    private readonly distributionEventService: DistributionEventService,
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
      const distributionEvent = await this.distributionEventService.findOne(
        this.configService.get('RABBITMQ_DISTRIBUTION_QUEUE'),
        message.type,
        true,
        true,
      );

      const subscriptions = filterSubscriptions(
        distributionEvent.subscriptions,
        message.payload,
      );

      if (_.isEmpty(subscriptions)) {
        return;
      }

      const subscriptionMembers = await this.subscriptionMemberService.get(
        subscriptions,
      );

      if (_.isEmpty(subscriptionMembers)) {
        return;
      }

      const distributionRuleIdx = this._getDistributionRuleIdx(
        distributionEvent,
        message.metadata,
      );

      const jobs = createNotificationJobs(
        distributionEvent.rules[distributionRuleIdx],
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

  private _getDistributionRuleIdx(
    distributionEvent: DistributionEvent,
    metadata: any,
  ): number {
    let idx = distributionEvent.rules.findIndex((rule) =>
      hasMetadata(distributionEvent.metadataLabels, JSON.parse(rule.metadata), metadata),
    );

    if (idx < 0) {
      idx = distributionEvent.rules.findIndex((rule) => rule.metadata === null);

      if (idx < 0) {
        throw new Error(
          `Distribution Event queue=${distributionEvent.queue} messageType=${distributionEvent.messageType} does not have a default distribution rule defined!`,
        );
      }
    }

    return idx;
  }
}
