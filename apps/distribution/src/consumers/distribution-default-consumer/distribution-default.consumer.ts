import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Processor('distribution_default')
export class DistributionDefaultConsumer {
  private readonly logger = new Logger(DistributionDefaultConsumer.name);
  
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  @Process('*')
  async process(job: Job) {
    const jobName = job.name;
  }
}
