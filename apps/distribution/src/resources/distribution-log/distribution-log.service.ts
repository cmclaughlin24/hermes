import { errorToJson } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { DistributionJob } from '../../common/types/distribution-job.type';
import { MessageState } from '../../common/types/message-state.type';
import { DistributionAttempt } from './repository/entities/distribution-attempt.entity';
import { DistributionLog } from './repository/entities/distribution-log.entity';

@Injectable()
export class DistributionLogService {
  constructor(
    @InjectModel(DistributionLog)
    private readonly distributionLogModel: typeof DistributionLog,
    @InjectModel(DistributionAttempt)
    private readonly distributionAttemptModel: typeof DistributionAttempt,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Yields a list of DistributionLogs.
   * @param {string[]} eventTypes
   * @param {string[]} states
   * @returns {Promise<DistributionLog[]>}
   */
  async findAll(eventTypes: string[], states: string[]) {
    return this.distributionLogModel.findAll({
      where: this._buildWhereClause(eventTypes, states),
      include: [DistributionAttempt],
    });
  }

  /**
   * Yields a DistributionLog.
   * @param {string} id
   * @returns {Promise<DistributionLog>}
   */
  async findOne(id: string) {
    return this.distributionLogModel.findByPk(id, {
      include: [DistributionAttempt],
    });
  }

  /**
   * Update a DistributionLog or create a new record if one does not exist.
   * @param {DistributionJob} distributionJob
   * @param {MessageState} state
   * @param {any} result
   * @param {Error} error
   * @returns {Promise<DistributionLog>}
   */
  async log(
    distributionJob: DistributionJob,
    state: MessageState,
    result?: any,
    error?: Error,
  ) {
    const log = await this.distributionLogModel.findByPk(distributionJob.id);
    const errorJson = errorToJson(error);

    if (!log) {
      return this._createLog(distributionJob, state, result, errorJson);
    }

    return this._updateLog(distributionJob, state, result, errorJson);
  }

  /**
   * Yields an object containing key-value pairs with the filter(s) (queues, messsageTypes,
   * and/or states) that should be applied on a DistributionLog repository query.
   * @param {string[]} eventTypes
   * @param {string[]} states
   * @returns
   */
  private _buildWhereClause(
    eventTypes: string[],
    states: string[],
  ) {
    const where: any = {};

    if (!_.isEmpty(eventTypes)) {
      where.eventType = {
        [Op.or]: eventTypes,
      };
    }

    if (!_.isEmpty(states)) {
      where.state = {
        [Op.or]: states,
      };
    }

    return Object.keys(where).length > 0 ? where : null;
  }

  /**
   * Creates a DistributionLog and a DistributionAttempt if the message
   * state is `COMPLETED` or `FAILED`.
   * @param {DistributionJob} distributionJob
   * @param {MessageState} state
   * @param {any} result
   * @param {Record<string, any>} error
   * @returns {Promise<DistributionLog>}
   */
  private async _createLog(
    distributionJob: DistributionJob,
    state: MessageState,
    result: any,
    error: Record<string, any>,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      const log = await this.distributionLogModel.create(
        {
          id: distributionJob.id,
          eventType: distributionJob.type,
          state,
          attempts: distributionJob.attemptsMade,
          data: distributionJob.payload,
          metadata: distributionJob.metadata,
          addedAt: distributionJob.addedAt,
          finishedAt: distributionJob.finishedAt,
        },
        { transaction },
      );

      if (state === MessageState.COMPLETED || state === MessageState.FAILED) {
        await this.distributionAttemptModel.create(
          {
            logId: log.id,
            result,
            error,
            attempt: distributionJob.attemptsMade,
            processedOn: distributionJob.processedAt,
          },
          { transaction },
        );

        await log.reload({ transaction, include: [DistributionAttempt] });
      }

      return log;
    });
  }

  /**
   * Updates a DistributionLog and creates a new DistributionAttempt if the
   * message state is `COMPLETED` or `FAILED`.
   * @param {DistributionJob} distributionJob
   * @param {MessageState} state
   * @param {any} result
   * @param {Record<string, any>} error
   * @returns {Promise<DistributionLog>}
   */
  private async _updateLog(
    distributionJob: DistributionJob,
    state: MessageState,
    result: any,
    error: Record<string, any>,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      let log = await this.distributionLogModel.findByPk(distributionJob.id, {
        transaction,
      });

      await log.update(
        {
          state,
          attempts: distributionJob.attemptsMade,
          finishedAt: distributionJob.finishedAt,
        },
        { transaction },
      );

      if (state === MessageState.COMPLETED || state === MessageState.FAILED) {
        await this.distributionAttemptModel.create(
          {
            logId: log.id,
            result,
            error,
            attempt: distributionJob.attemptsMade,
            processedOn: distributionJob.processedAt,
          },
          { transaction },
        );

        await log.reload({ transaction, include: [DistributionAttempt] });
      }

      return log;
    });
  }
}
