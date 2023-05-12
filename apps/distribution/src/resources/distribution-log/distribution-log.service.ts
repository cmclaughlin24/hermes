import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MessageState } from '../../common/types/message-state.types';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';

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
   * Yields a list of DistributionLogs or throws a NotFoundExceptions if
   * the repository returns null, undefined, or an empty list.
   * @param {string[]} queues
   * @param {string[]} messageTypes
   * @param {string[]} states
   * @returns {Promise<DistributionLog[]>}
   */
  async findAll(queues: string[], messageTypes: string[], states: string[]) {
    const distributionLogs = await this.distributionLogModel.findAll({
      where: this._buildWhereClause(queues, messageTypes, states),
      include: [DistributionAttempt],
    });

    if (_.isEmpty(distributionLogs)) {
      throw new NotFoundException(`Distribution logs not found!`);
    }

    return distributionLogs;
  }

  /**
   * Yields a DistributionLog or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} id
   * @returns {Promise<DistributionLog>}
   */
  async findOne(id: string) {
    const distributionLog = await this.distributionLogModel.findByPk(id, {
      include: [DistributionAttempt],
    });

    if (!distributionLog) {
      throw new NotFoundException(`Distribution log with id=${id} not found!`);
    }

    return distributionLog;
  }

  async log(
    // Todo: Improve TypeScript support for Distribution Job.
    distributionJob: any,
    state: MessageState,
    result?: any,
    error?: any,
  ) {
    const log = await this.distributionLogModel.findByPk(distributionJob.id);

    if (!log) {
      return this._createLog(distributionJob, state, result, error);
    }

    return this._updateLog(distributionJob, state, result, error);
  }

  /**
   * Yields an object containing key-value pairs with the filter(s) (queues, messsageTypes,
   * and/or states) that should be applied on a DistributionLog repository query.
   * @param {string[]} queues
   * @param {string[]} messageTypes
   * @param {string[]} states
   * @returns
   */
  private _buildWhereClause(
    queues: string[],
    messageTypes: string[],
    states: string[],
  ) {
    const where: any = {};

    if (!_.isEmpty(queues)) {
      where.queue = {
        [Op.or]: queues,
      };
    }

    if (!_.isEmpty(messageTypes)) {
      where.messageType = {
        [Op.or]: messageTypes,
      };
    }

    if (!_.isEmpty(states)) {
      where.state = {
        [Op.or]: states,
      };
    }

    return Object.keys(where).length > 0 ? where : null;
  }

  private async _createLog(
    distributionJob: any,
    state: MessageState,
    result: any,
    error: any,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      const log = await this.distributionLogModel.create(
        {
          id: distributionJob.id,
          queue: distributionJob.queue,
          messageType: distributionJob.type,
          state,
          attempts: distributionJob.attemptsMade,
          data: distributionJob.payload,
          metadata: distributionJob.metadata,
          addedAt: distributionJob.addedAt,
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
            processedOn: distributionJob.processedOn,
          },
          { transaction },
        );

        await log.reload({ transaction, include: [DistributionAttempt] });
      }

      return log;
    });
  }

  private async _updateLog(
    distributionJob: any,
    state: MessageState,
    result: any,
    error: any,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      let log = await this.distributionLogModel.findByPk(distributionJob.id, {
        transaction,
      });

      await log.update(
        {
          state,
          attempts: distributionJob.attemptsMade,
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
            processedOn: distributionJob.processedOn,
          },
          { transaction },
        );

        await log.reload({ transaction, include: [DistributionAttempt] });
      }

      return log;
    });
  }
}
