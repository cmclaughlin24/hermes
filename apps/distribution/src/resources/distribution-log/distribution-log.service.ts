import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MessageState } from '../../common/constants/message-state.constants';
import { MessageDto } from '../../common/dto/message.dto';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';

@Injectable()
export class DistributionLogService {
  constructor(
    @InjectModel(DistributionLog)
    private readonly distributionLogModel: typeof DistributionLog,
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
    queue: string,
    message: MessageDto,
    state: MessageState,
    result: any,
    error: any,
  ) {
    const log = await this.distributionLogModel.findByPk(message.id);

    if (!log) {
      return this._createLog(state);
    }

    return this._updateLog(state);
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

  private async _createLog(state: MessageState) {
    return this.sequelize.transaction(async (transaction) => {
      // Todo: Create a new distribution log.

      if (state === MessageState.COMPLETED || state === MessageState.FAILED) {
        // Todo: Create a new distribution attempt.
      }
    });
  }

  private async _updateLog(state: MessageState) {
    return this.sequelize.transaction(async (transaction) => {
      // Todo: Update an existing distribution log.

      if (state === MessageState.COMPLETED || state === MessageState.FAILED) {
        // Todo: Create a new distribution attempt.
      }
    });
  }
}
