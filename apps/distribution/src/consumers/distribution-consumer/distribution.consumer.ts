import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('distribution_default')
export class DistributionConsumer {
  constructor() {}

  @Process('*')
  async process(job: Job) {}
}
