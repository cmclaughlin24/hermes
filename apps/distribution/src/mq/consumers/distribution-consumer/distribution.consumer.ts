import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { hasMetadata } from '@hermes/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsumeMessage } from 'amqplib';
import { DistributionJob } from 'apps/distribution/src/common/types/distribution-job.types';
import { MessageState } from 'apps/distribution/src/common/types/message-state.types';
import { DistributionEventService } from 'apps/distribution/src/resources/distribution-event/distribution-event.service';
import { Queue } from 'bullmq';
import * as _ from 'lodash';
import { MessageDto } from '../../../common/dto/message.dto';
import { SubscriptionMemberService } from '../../../common/providers/subscription-member/subscription-member.service';
import { createNotificationJobs } from '../../../common/utils/notification-job.utils';
import { filterSubscriptions } from '../../../common/utils/subscription-filter.utils';
import { DistributionEvent } from '../../../resources/distribution-event/entities/distribution-event.entity';
import { DistributionLogService } from '../../../resources/distribution-log/distribution-log.service';
import { DistributionRule } from '../../../resources/distribution-rule/entities/distribution-rule.entity';

@Injectable()
export class DistributionConsumer {
  private readonly logger = new Logger(DistributionConsumer.name);

  constructor(
    @InjectQueue(process.env.BULLMQ_NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    private readonly configService: ConfigService,
    private readonly distributionEventService: DistributionEventService,
    private readonly distributionLogService: DistributionLogService,
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
    let result, error;

    try {
      const distributionEvent = await this.distributionEventService.findOne(
        this.configService.get('RABBITMQ_DISTRIBUTION_QUEUE'),
        message.type,
        true,
        true,
      );
      const distributionRule = this._getDistributionRule(
        distributionEvent,
        message.metadata,
      );
      
      // Todo: Check if the subscriptions should be bypassed.
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
    } finally {
      // Todo: Set correct values for distribution log.
      const state = error ? MessageState.FAILED : MessageState.COMPLETED;
      const job: DistributionJob = {
        queue: this.configService.get('RABBITMQ_DISTRIBUTION_QUEUE'),
        attemptsMade: 0,
        processedAt: new Date(),
        finishedAt: new Date(),
        ...message,
      };

      // await this.distributionLogService.log(job, state, result, error);
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

  private _getDistributionRule(
    distributionEvent: DistributionEvent,
    metadata: any,
  ): DistributionRule {
    let rule = distributionEvent.rules.find((rule) =>
      hasMetadata(
        distributionEvent.metadataLabels,
        JSON.parse(rule.metadata),
        metadata,
      ),
    );

    if (!rule) {
      rule = distributionEvent.rules.find((rule) => rule.metadata === null);

      if (!rule) {
        throw new Error(
          `Distribution Event queue=${distributionEvent.queue} messageType=${distributionEvent.messageType} does not have a default distribution rule defined!`,
        );
      }
    }

    return rule;
  }
}
