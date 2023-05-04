import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { DistributionLog } from './entities/distribution-log.entity';

@Injectable()
export class DistributionLogService {
  constructor(
    @InjectModel(DistributionLog)
    private readonly distributionLogModel: typeof DistributionLog,
  ) {}

  async findAll(queues: string[], messageTypes: string[], states: string[]) {
    const distributionLogs = await this.distributionLogModel.findAll({
      where: this._buildWhereClause(queues, messageTypes, states),
    });

    if (_.isEmpty(distributionLogs)) {
      throw new NotFoundException(`Distribution logs not found!`);
    }

    return distributionLogs;
  }

  async findOne(id: string) {
    const distributionLog = await this.distributionLogModel.findByPk(id);

    if (!distributionLog) {
      throw new NotFoundException(`Distribution log with id=${id} not found!`);
    }

    return distributionLog;
  }

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
