import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { DistributionQueues, NotificationQueues } from '@notification/common';
import { Job, Queue } from 'bull';

@Processor(DistributionQueues.DEFAULT)
export class DistributionDefaultConsumer {
  private readonly logger = new Logger(DistributionDefaultConsumer.name);
  
  constructor(
    @InjectQueue(NotificationQueues.DEFAULT) private readonly notificationQueue: Queue,
  ) {}

  @Process('*')
  async process(job: Job) {
    const jobName = job.name;
  }
}
