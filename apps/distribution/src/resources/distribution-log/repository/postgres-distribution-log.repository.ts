import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { DistributionJob } from 'apps/distribution/src/common/types/distribution-job.type';
import { MessageState } from '../../../common/types/message-state.type';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';
import { DistributionLogRepository } from './distribution-log.repository';

@Injectable()
export class PostgresDistributionLogRepository
  implements DistributionLogRepository
{
  constructor(
    @InjectModel(DistributionLog)
    private readonly distributionLogModel: typeof DistributionLog,
    @InjectModel(DistributionAttempt)
    private readonly distributionAttemptModel: typeof DistributionAttempt,
    private readonly sequelize: Sequelize,
  ) {}

  async findAll(eventTypes: string[], states: string[]) {
    return this.distributionLogModel.findAll({
      where: this._buildWhereClause(eventTypes, states),
      include: [DistributionAttempt],
    });
  }

  async findOne(id: string) {
    return this.distributionLogModel.findByPk(id, {
      include: [DistributionAttempt],
    });
  }

  async create(
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

  async update(
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

  private _buildWhereClause(eventTypes: string[], states: string[]) {
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
}
