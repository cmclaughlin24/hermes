import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as _ from 'lodash';
import { DistributionJob } from 'apps/distribution/src/common/types/distribution-job.type';
import { MessageState } from '../../../common/types/message-state.type';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';
import { DistributionLogRepository } from './distribution-log.repository';

@Injectable()
export class OrmDistributionLogRepository implements DistributionLogRepository {
  constructor(
    @InjectRepository(DistributionLog)
    private readonly distributionLogModel: Repository<DistributionLog>,
    @InjectRepository(DistributionAttempt)
    private readonly distributionAttemptModel: Repository<DistributionAttempt>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(eventTypes: string[], states: string[]) {
    return this.distributionLogModel.find({
      where: this._buildWhereClause(eventTypes, states),
      relations: { attemptHistory: true },
    });
  }

  async findOne(id: string) {
    return this.distributionLogModel.findOne({
      where: { id },
      relations: { attemptHistory: true },
    });
  }

  async create(
    distributionJob: DistributionJob,
    state: MessageState,
    result: any,
    error: Record<string, any>,
  ) {
    const attempts =
      state === MessageState.COMPLETED || state === MessageState.FAILED
        ? [
            this.distributionAttemptModel.create({
              result,
              error,
              attempt: distributionJob.attemptsMade,
              processedAt: distributionJob.processedAt,
            }),
          ]
        : [];
    const log = this.distributionLogModel.create({
      id: distributionJob.id,
      eventType: distributionJob.type,
      state,
      attempts: distributionJob.attemptsMade,
      data: distributionJob.payload,
      metadata: distributionJob.metadata,
      addedAt: distributionJob.addedAt,
      finishedAt: distributionJob.finishedAt,
      attemptHistory: attempts,
    });

    return this.distributionLogModel.save(log);
  }

  async update(
    distributionJob: DistributionJob,
    state: MessageState,
    result: any,
    error: Record<string, any>,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let log = await this.distributionLogModel.preload({
        id: distributionJob.id,
        state,
        attempts: distributionJob.attemptsMade,
        finishedAt: distributionJob.finishedAt,
      });

      // NOTE: A DistributionAttempt entry should only be created for completed/failed MessageState.
      if (state === MessageState.COMPLETED || state === MessageState.FAILED) {
        const attempt = this.distributionAttemptModel.create({
          logId: log.id,
          result,
          error,
          attempt: distributionJob.attemptsMade,
          processedAt: distributionJob.processedAt,
        });

        await this.distributionAttemptModel.save(attempt);
      }

      log = await this.distributionLogModel.save(log);
      await queryRunner.commitTransaction();

      return log;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private _buildWhereClause(eventTypes: string[], states: string[]) {
    const where: any = {};

    if (!_.isEmpty(eventTypes)) {
      where.eventType = eventTypes;
    }

    if (!_.isEmpty(states)) {
      where.state = states;
    }

    return Object.keys(where).length > 0 ? where : null;
  }
}
