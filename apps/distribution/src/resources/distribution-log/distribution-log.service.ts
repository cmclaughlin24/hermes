import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';

@Injectable()
export class DistributionLogService {
  constructor(
    @InjectModel(DistributionLog)
    private readonly distributionLogModel: typeof DistributionLog,
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
}
