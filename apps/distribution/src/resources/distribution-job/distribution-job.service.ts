import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApiResponseDto,
  DistributionExchanges,
  DistributionQueues
} from '@notification/common';
import { Job, JobState, Queue } from 'bullmq';
import * as _ from 'lodash';
import { CreateDistributionJobDto } from './dto/create-distribution-job.dto';

@Injectable()
export class DistributionJobService {
  constructor(
    @InjectQueue(DistributionQueues.DISTRIBUTE)
    private readonly defaultQueue: Queue,
    @InjectQueue('distribution_subscription')
    private readonly subscriptionQueue: Queue,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  /**
   * Yields a list of Jobs by the state from the default distribution queue or throws
   * a NotFoundException if the queue returns null, undefined, or an empty list.
   * @param {JobState[]} states
   * @returns {Promise<Job[]>}
   */
  async findDefaultDistributionJobs(states: JobState[]) {
    const jobs = await this.defaultQueue.getJobs(states);

    if (_.isEmpty(jobs)) {
      throw new NotFoundException(
        `Jobs with state(s) ${states.join(', ')} not found!`,
      );
    }

    return jobs;
  }

  /**
   * Yields a Job from the default distribution queue or throws a NotFoundException
   * if the queue returns null or undefined.
   * @param {string} id
   * @returns {Promise<Job>}
   */
  async findDefaultDistributionJob(id: string) {
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
    // const job = await this.defaultQueue.add(
    //   createDefaultDistributionJob.rule,
    //   createDefaultDistributionJob.payload,
    // );

    await this.amqpConnection.publish(
      DistributionExchanges.DEFAULT,
      '',
      createDefaultDistributionJob,
    );

    return new ApiResponseDto<Job>(
      `Successfully scheduled ${createDefaultDistributionJob.rule} on ${DistributionQueues.DISTRIBUTE} queue!`,
    );
  }
}
