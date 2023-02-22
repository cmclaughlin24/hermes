import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Processor('distribution_default')
export class DistributionConsumer {
  private readonly logger = new Logger(DistributionConsumer.name);
  
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  @Process('*')
  async process(job: Job) {
    const jobName = job.name;
  }
}
