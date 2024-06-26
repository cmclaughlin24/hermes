import {
  Nack,
  RABBIT_HANDLER,
  RabbitHandlerConfig,
  isRabbitContext,
} from '@golevelup/nestjs-rabbitmq';
import { MessageDto } from '@hermes/common';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { RpcArgumentsHost } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ConsumeMessage } from 'amqplib';
import { Observable, catchError, map } from 'rxjs';
import { DistributionJob } from '../../../common/types/distribution-job.type';
import { MessageState } from '../../../common/types/message-state.type';
import { getAttempts } from '../../../common/utils/amqp.utils';
import { DistributionLogService } from '../../../resources/distribution-log/distribution-log.service';
import { MqUnrecoverableError } from '../../classes/mq-unrecoverable-error.class';

@Injectable()
export class MqInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MqInterceptor.name);

  constructor(
    private readonly distributionLogService: DistributionLogService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    if (!isRabbitContext(context)) {
      return next.handle();
    }

    const rpc: RpcArgumentsHost = context.switchToRpc();
    const message: MessageDto = rpc.getData();
    const amqpMsg: ConsumeMessage = rpc.getContext();
    const { queue } = this.reflector.get<RabbitHandlerConfig>(
      RABBIT_HANDLER,
      context.getHandler(),
    );
    const distributionJob: DistributionJob = {
      attemptsMade: getAttempts(amqpMsg, queue),
      processedAt: new Date(),
      finishedAt: null,
      ...message,
    };

    await this._log(distributionJob, MessageState.ACTIVE, null, null);

    return next.handle().pipe(
      map(async (result) => {
        await this._log(distributionJob, MessageState.COMPLETED, result, null);
      }),
      catchError(async (error) => {
        await this._log(distributionJob, MessageState.FAILED, null, error);

        if (this._shouldRetry(error, distributionJob.attemptsMade)) {
          return new Nack();
        }
      }),
    );
  }

  /**
   * Stores a record in the database containing information about the job's current
   * state, number of attempts, processing time, and response stream.
   * @param {DistributionJob} job
   * @param {MessageState} state
   * @param {any} result
   * @param {Error} error
   */
  private async _log(
    job: DistributionJob,
    state: MessageState,
    result: any,
    error: Error,
  ) {
    if (state === MessageState.COMPLETED || state === MessageState.FAILED) {
      job.finishedAt = new Date();
    }

    try {
      await this.distributionLogService.log(job, state, result, error);
    } catch (err) {
      this.logger.error(
        `Failed to log message=${job.id} state=${state} attempt=${job.attemptsMade} to the database`,
      );
    }
  }

  /**
   * Yields true if a message has not exceeded the max retry attempts and the error is
   * not an MqUnrecoverableError or false otherwise.
   * @param {Error} error
   * @param {number} attemptsMade
   * @returns {boolean}
   */
  private _shouldRetry(error: Error, attemptsMade: number): boolean {
    return (
      !(error instanceof MqUnrecoverableError) &&
      attemptsMade <= this.configService.get('RETRY_ATTEMPTS')
    );
  }
}
