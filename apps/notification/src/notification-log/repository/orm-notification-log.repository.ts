import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { DataSource, In, Repository } from 'typeorm';
import { NotificationLogEntity } from './entities/notification-log.entity';
import { NotificationAttemptEntity } from './entities/notification-attempt.entity';
import { Job, JobState } from 'bullmq';
import { NotificationLogRepository } from './notification-log.repository';
import { NotificationLog } from '../domain/notification-log';

@Injectable()
export class OrmNotificationLogRepository implements NotificationLogRepository {
  constructor(
    @InjectRepository(NotificationLogEntity)
    private readonly notificationLogModel: Repository<NotificationLogEntity>,
    @InjectRepository(NotificationAttemptEntity)
    private readonly notificationAttemptModel: Repository<NotificationAttemptEntity>,
    private readonly dataSource: DataSource,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async findAll(jobs: string[], states: JobState[]) {
    return this.notificationLogModel
      .find({
        where: this._buildWhereClause(jobs, states),
        relations: { attemptHistory: true },
      })
      .then((entities) =>
        this.mapper.mapArray(entities, NotificationLogEntity, NotificationLog),
      );
  }

  async findOne(id: string) {
    return this.notificationLogModel
      .findOne({
        where: { id },
        relations: { attemptHistory: true },
      })
      .then((entity) => this._toDomain(entity));
  }

  async create(
    job: Job,
    state: JobState,
    result: any,
    error: Record<string, any>,
  ) {
    const attempts =
      state === 'completed' || state === 'failed'
        ? [
            this.notificationAttemptModel.create({
              attempt: job.attemptsMade,
              processedAt: new Date(job.processedOn),
              result: result,
              error: error,
            }),
          ]
        : [];
    const log = this.notificationLogModel.create({
      job: job.name,
      state: state,
      attempts: job.attemptsMade,
      data: job.data,
      addedAt: new Date(job.timestamp),
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      attemptHistory: attempts,
    });

    return this.notificationLogModel.save(log).then((l) => l.id);
  }

  async update(
    job: Job,
    state: JobState,
    result: any,
    error: Record<string, any>,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // NOTE: Remove the database id from the job's data before updating the record.
      const data = { ...job.data };
      delete data.notification_database_id;

      const log = await this.notificationLogModel.preload({
        id: job.data.notification_database_id,
        state: state,
        attempts: job.attemptsMade,
        data: data,
        finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      });

      // NOTE: A NotificationAttempt entry should only be created for completed/failed JobStates.
      if (state === 'completed' || state === 'failed') {
        const attempt = this.notificationAttemptModel.create({
          attempt: job.attemptsMade,
          processedAt: new Date(job.processedOn),
          result: result,
          error: error,
          log,
        });

        await this.notificationAttemptModel.save(attempt);
      }

      return this.notificationLogModel.save(log).then(async (l) => {
        await queryRunner.commitTransaction();
        return l.id;
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Yields an object containing key-value pairs with the filter(s) (queues and/or
   * states) that should be applied on a NotificationLog repository query.
   * @param {string[]} jobs
   * @param {string[]} states
   */
  private _buildWhereClause(jobs: string[], states: string[]) {
    const where: any = {};

    if (!_.isEmpty(jobs)) {
      where.job = In(jobs);
    }

    if (!_.isEmpty(states)) {
      where.state = In(states);
    }

    return Object.keys(where).length > 0 ? where : null;
  }

  private _toDomain(entity: NotificationLogEntity): NotificationLog {
    return this.mapper.map(entity, NotificationLogEntity, NotificationLog);
  }
}
