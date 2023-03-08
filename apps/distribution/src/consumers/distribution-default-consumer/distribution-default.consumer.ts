import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { DistributionQueues, NotificationQueues } from '@notification/common';
import { Job, JobId, Queue } from 'bull';
import * as _ from 'lodash';
import { SubscriptionFilterService } from '../../common/providers/subscription-filter/subscription-filter.service';
import { SubscriptionMemberService } from '../../common/providers/subscription-member/subscription-member.service';
import { DistributionRuleService } from '../../resources/distribution-rule/distribution-rule.service';

@Processor(DistributionQueues.DEFAULT)
export class DistributionDefaultConsumer {
  private readonly logger = new Logger(DistributionDefaultConsumer.name);

  constructor(
    @InjectQueue(NotificationQueues.DEFAULT)
    private readonly notificationQueue: Queue,
    private readonly distributionRuleService: DistributionRuleService,
    private readonly subscriptionFilterService: SubscriptionFilterService,
    private readonly subscriptionMemberService: SubscriptionMemberService,
  ) {}

  @Process('*')
  async process(job: Job) {
    const logPrefix = this._createLogPrefix(this.process.name, job.id);
    const rule = job.name;

    job.log(`${logPrefix}: Processing ${rule}`);

    try {
      job.log(`${logPrefix}: Retrieving ${rule} distribution rule`);

      const distributionRule = await this.distributionRuleService.findOne(
        DistributionQueues.DEFAULT,
        rule,
        true,
      );

      job.log(
        `${logPrefix}: Distribution rule ${rule} found, checking subscriptions`,
      );

      const subscriptions = this.subscriptionFilterService.filter(
        distributionRule.subscriptions,
        job.data,
      );

      if (_.isEmpty(subscriptions)) {
        // Fixme: Return a message if there aren't any subscriptions.
      }

      job.log(
        `${logPrefix}: ${subscriptions.length} subscriptions for ${rule}, requesting subscription member(s)`,
      );

      const members = await this.subscriptionMemberService.get(subscriptions);

      if (_.isEmpty(members)) {
        // Fixme: Return a message if there aren't any subscription members.
      }

      job.log(
        `${logPrefix}: Recieved ${members.length} members for ${subscriptions.length} subscriptions`,
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Yields a formatted string with the class's name and function's name in square brackets
   * followed by the Bull job id. (e.g. [ClassName FunctionName] Job JobId)
   * @param {string} functionName
   * @param {JobId} jobId
   * @returns {string}
   */
  private _createLogPrefix(functionName: string, jobId: JobId): string {
    return `[${DistributionDefaultConsumer.name} ${functionName}] Job ${jobId}`;
  }
}
