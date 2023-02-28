import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponseDto, DistributionQueues } from '@notification/common';
import { Job, JobStatus, Queue } from 'bull';
import * as _ from 'lodash';
import { queuePool } from '../../config/bull.config';
import { CreateDistributionJobDto } from './dto/create-distribution-job.dto';

@Injectable()
export class DistributionJobService {
  constructor(
    @InjectQueue(DistributionQueues.DEFAULT)
    private readonly defaultQueue: Queue,
    @InjectQueue('distribution_subscription')
    private readonly subscriptionQueue: Queue,
  ) {
    queuePool.add(defaultQueue);
    queuePool.add(subscriptionQueue);
  }

  /**
   * Yields a list of Jobs by the status from the default distribution queue or throws
   * a NotFoundException if the queue yields null, undefined, or an empty list.
   * @param {JobStatus[]} statuses
   * @returns {Promise<Job[]>}
   */
  async findDefaultDistributionJobs(statuses: JobStatus[]) {
    const jobs = await this.defaultQueue.getJobs(statuses);

    if (_.isEmpty(jobs)) {
      throw new NotFoundException(
        `Jobs with status(es) ${statuses.join(', ')} not found!`,
      );
    }

    return jobs;
  }

  /**
   * Yields a Job from the default distribution queue or throws a NotFoundException
   * if the queue yields null or undefined.
   * @param {number} id
   * @returns {Promise<Job>}
   */
  async findDefaultDistributionJob(id: number) {
    const job = await this.defaultQueue.getJob(id);

    if (!job) {
      throw new NotFoundException(
        `Job with ${id} not found in '${this.defaultQueue.name}' queue`,
      );
    }

    return job;
  }

  /**
   * Adds a job to the default distribution queue.
   * @param {CreateDistributionJobDto} createDefaultDistributionJob
   * @returns {Promise<ApiResponseDto<Job>>}
   */
  async createDefaultDistributionJob(
    createDefaultDistributionJob: CreateDistributionJobDto,
  ) {
    const job = await this.defaultQueue.add(
      createDefaultDistributionJob.rule,
      createDefaultDistributionJob.payload,
    );

    return new ApiResponseDto<Job>(
      `Successfully scheduled ${createDefaultDistributionJob.rule} on ${DistributionQueues.DEFAULT} queue!`,
      job
    );
  }
}
