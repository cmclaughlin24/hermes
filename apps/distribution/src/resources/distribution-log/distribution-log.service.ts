import { errorToJson } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { DistributionJob } from '../../common/types/distribution-job.type';
import { MessageState } from '../../common/types/message-state.type';
import { DistributionLogRepository } from './repository/distribution-log.repository';

@Injectable()
export class DistributionLogService {
  constructor(private readonly repository: DistributionLogRepository) {}

  /**
   * Yields a list of DistributionLogs.
   * @param {string[]} eventTypes
   * @param {string[]} states
   */
  async findAll(eventTypes: string[], states: string[]) {
    return this.repository.findAll(eventTypes, states);
  }

  /**
   * Yields a DistributionLog.
   * @param {string} id
   */
  async findOne(id: string) {
    return this.repository.findOne(id);
  }

  /**
   * Update a DistributionLog or create a new record if one does not exist.
   * @param {DistributionJob} distributionJob
   * @param {MessageState} state
   * @param {any} result
   * @param {Error} error
   */
  async log(
    distributionJob: DistributionJob,
    state: MessageState,
    result?: any,
    error?: Error,
  ) {
    const log = await this.repository.findOne(distributionJob.id);
    const errorJson = errorToJson(error);

    if (!log) {
      return this.repository.create(distributionJob, state, result, errorJson);
    }

    return this.repository.update(distributionJob, state, result, errorJson);
  }
}
