import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DistributionQueues } from '@notification/common';
import { Queue } from 'bull';
import { CreateDistributionJobDto } from './dto/create-distribution-job.dto';

@Injectable()
export class DistributionJobService {
  constructor(
    @InjectQueue(DistributionQueues.DEFAULT)
    private readonly defaultQueue: Queue,
  ) {}

  async findDefaultDistributionJobs() {}

  async findDefaultDistributionJob(id: number) {
    const job = await this.defaultQueue.getJob(id);

    if (!job) {
      throw new NotFoundException(
        `Job with ${id} not found in '${this.defaultQueue.name}' queue`,
      );
    }

    return job;
  }

  async createDefaultDistributionJob(
    createDefaultDistributionJob: CreateDistributionJobDto,
  ) {}
}
