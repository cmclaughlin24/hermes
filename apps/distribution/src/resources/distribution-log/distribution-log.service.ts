import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DistributionQueues } from '@notification/common';
import { Job, JobState } from 'bullmq';
import * as _ from 'lodash';
import { DistributionLog } from './entities/distribution-log.entity';

@Injectable()
export class DistributionLogService {
  private readonly logger = new Logger(DistributionLogService.name);

  constructor(
    @InjectModel(DistributionLog)
    private readonly distritbutionLogModel: typeof DistributionLog,
  ) {}

  /**
   * Yields a list of DistributionLogs filtered by the queue, rule name, and/or
   * state. Throws a NotFoundException if the repository returns null, undefined,
   * or an empty list.
   * @param {DistributionQueues[]} queues
   * @param {string[]} rules
   * @param {JobState[]} states
   * @returns {Promise<DistributionLog[]>}
   */
  async findAll(
    queues: DistributionQueues[],
    rules: string[],
    states: JobState[],
  ) {
    const distributionLogs = await this.distritbutionLogModel.findAll({
      where: { queues, rules, states },
    });

    if (_.isEmpty(distributionLogs)) {
      throw new NotFoundException('Distribution logs not found!');
    }

    return distributionLogs;
  }

  /**
   * Yields a DistributionLog or throws a NotFoundException if the repository
   * return null or undefined.
   * @param {string} id
   * @returns {Promise<DistributionLog>}
   */
  async findOne(id: string) {
    const distributionLog = await this.distritbutionLogModel.findByPk(id);

    if (!distributionLog) {
      throw new NotFoundException(`Distribution Log with ${id} not found!`);
    }

    return distributionLog;
  }

  /**
   * Update a DistributionLog or create a new record if one does not exits. Will not update
   * a DistributionLog if the number of attempts in the job object are less than the number of
   * attempts stored in the DistributionLog.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  async createOrUpdate(job: Job, state: JobState, result: any, error: Error) {
    if (!job.data.distribution_database_id) {
      return this._createLog(job, state, result, error);
    }

    return this._updateLog(job, state, result, error);
  }

  /**
   * Create a DistributionLog.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  private async _createLog(
    job: Job,
    state: JobState,
    result: any,
    error: Error,
  ) {
    const log = await this.distritbutionLogModel.create({
      queue: job.queueName,
      rule: job.name,
      state: state,
      attemps: job.attemptsMade,
      data: job.data,
      result: result,
      error: error,
    });

    return log.id;
  }

  /**
   * Updates a DistributionLog if the number of attempts in job is greater than
   * the number of attempts in the record.
   * @param {Job} job
   * @param {JobState} state
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<string>}
   */
  private async _updateLog(
    job: Job,
    state: JobState,
    result: any,
    error: Error,
  ) {
    let log = await this.distritbutionLogModel.findByPk(
      job.data.distribution_database_id,
    );

    if (log.attempts > job.attemptsMade) {
      this.logger.warn(
        `[${this._updateLog.name}] Distribution Log attempts (${log.attempts}) greater than job attemps (${job.attemptsMade}), no update`,
      );
      return log.id;
    }

    // Note: Remove the database id from the job's data before updating the record.
    const data = { ...job.data };
    delete data.notification_database_id;

    log = await log.update({
      queue: job.queueName,
      rule: job.name,
      state: state,
      attemps: job.attemptsMade,
      data: job.data,
      result: result,
      error: error,
    });

    return log.id;
  }
}
