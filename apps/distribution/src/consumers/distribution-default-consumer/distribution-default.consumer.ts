import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { DistributionQueues, NotificationQueues } from '@notification/common';
import { Job, JobId, Queue } from 'bull';
import * as _ from 'lodash';
import { DistributionRuleService } from '../../resources/distribution-rule/distribution-rule.service';

@Processor(DistributionQueues.DEFAULT)
export class DistributionDefaultConsumer {
  private readonly logger = new Logger(DistributionDefaultConsumer.name);

  constructor(
    @InjectQueue(NotificationQueues.DEFAULT)
    private readonly notificationQueue: Queue,
    private readonly distributionRuleService: DistributionRuleService,
  ) {}

  @Process('*')
  async process(job: Job) {
    const logPrefix = this._createLogPrefix(this.process.name, job.id);
    const jobName = job.name;

    job.log(`${logPrefix}: Processing ${jobName}`);

    try {
      job.log(`${logPrefix}: Retrieving ${jobName} distribution rule`);

      const distributionRule = await this.distributionRuleService.findOne(
        DistributionQueues.DEFAULT,
        jobName,
        true,
      );

      const subscriptions = this._getSubscriptions(distributionRule.subscriptions, job.data);

      if (_.isEmpty(subscriptions)) {
        // Fixme: Return if there aren't any subscriptions.
      }
    } catch (error) {
      throw error;
    }
  }

  private _getSubscriptions(subscriptions: any[], payload: any) {
    if (_.isElement(subscriptions)) {
      return [];
    }

    return subscriptions.filter((subscription) =>
      this._isSubscribed(subscription, payload),
    );
  }

  private _isSubscribed(subscription: any, payload: any) {
    let isSubscribed = true;

    // Note: If a subscription does not have filters, assume the subscription should receive a
    //       notification.
    if (_.isEmpty(subscription)) {
      return true;
    }

    // Fixme: Filter subscriptions based on the payload contents.
    return isSubscribed;
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
