import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationQueues } from '@notification/common';
import { Queue } from 'bullmq';
import { SubscriptionFilterService } from '../../../common/providers/subscription-filter/subscription-filter.service';
import { SubscriptionMemberService } from '../../../common/providers/subscription-member/subscription-member.service';
import { DistributionRuleService } from '../../../resources/distribution-rule/distribution-rule.service';

@Injectable()
export class DistributionConsumer {
  private readonly logger = new Logger(DistributionConsumer.name);

  constructor(
    @InjectQueue(NotificationQueues.DEFAULT)
    private readonly notificationQueue: Queue,
    private readonly distributionRuleService: DistributionRuleService,
    private readonly subscriptionFilterService: SubscriptionFilterService,
    private readonly subscriptionMemberService: SubscriptionMemberService,
  ) {}

  @RabbitSubscribe({ queue: 'test' })
  async subscribe(message: {}) {
    const logPrefix = this._createLogPrefix(this.subscribe.name, '');
    this.logger.log(`${logPrefix}`, JSON.stringify(message));
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
