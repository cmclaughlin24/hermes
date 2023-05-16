import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { hasMetadata } from '@hermes/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsumeMessage } from 'amqplib';
import { Queue } from 'bullmq';
import * as _ from 'lodash';
import { MqUnrecoverableError } from '../../../common/classes/mq-unrecoverable-error.class';
import { MessageDto } from '../../../common/dto/message.dto';
import { SubscriptionMemberService } from '../../../common/providers/subscription-member/subscription-member.service';
import { createNotificationJobs } from '../../../common/utils/notification-job.utils';
import { filterSubscriptions } from '../../../common/utils/subscription-filter.utils';
import { DistributionEventService } from '../../../resources/distribution-event/distribution-event.service';
import { DistributionEvent } from '../../../resources/distribution-event/entities/distribution-event.entity';
import { DistributionLogService } from '../../../resources/distribution-log/distribution-log.service';
import { DistributionRule } from '../../../resources/distribution-rule/entities/distribution-rule.entity';
import { MqConsumer } from '../mq-consumer/mq.consumer';

@Injectable()
export class DistributionConsumer extends MqConsumer {
  protected override readonly logger = new Logger(DistributionConsumer.name);
  private DISTRIBUTION_QUEUE: string;

  constructor(
    @InjectQueue(process.env.BULLMQ_NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    private readonly distributionEventService: DistributionEventService,
    private readonly subscriptionMemberService: SubscriptionMemberService,
    protected readonly configService: ConfigService,
    protected readonly distributionLogService: DistributionLogService,
  ) {
    super(configService, distributionLogService);
    this.DISTRIBUTION_QUEUE = this.configService.get(
      'RABBITMQ_DISTRIBUTION_QUEUE',
    );
  }

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
    const logPrefix = this.createLogPrefix(this.subscribe.name, message.type);
    let result, error;

    try {
      const distributionEvent = await this.distributionEventService.findOne(
        this.DISTRIBUTION_QUEUE,
        message.type,
        true,
        true,
      );
      const distributionRule = this._getDistributionRule(
        distributionEvent,
        message.metadata,
      );

      // Todo: Check if the subscriptions should be bypassed.
      if (distributionRule.bypassSubscriptions) {
      }

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
      if (this.shouldRetry(error, amqpMsg, this.DISTRIBUTION_QUEUE)) {
        return new Nack();
      }
    } finally {
      await this.logAttempt(
        this.DISTRIBUTION_QUEUE,
        message,
        this.getAttempts(amqpMsg, this.DISTRIBUTION_QUEUE),
        result,
        error,
      );
    }
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
        throw new MqUnrecoverableError(
          `Distribution Event queue=${distributionEvent.queue} messageType=${distributionEvent.messageType} does not have a default distribution rule defined!`,
        );
      }
    }

    return rule;
  }
}
