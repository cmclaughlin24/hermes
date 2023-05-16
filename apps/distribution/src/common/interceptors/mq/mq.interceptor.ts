import { Nack } from '@golevelup/nestjs-rabbitmq';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ConsumeMessage } from 'amqplib';
import { DistributionLogService } from 'apps/distribution/src/resources/distribution-log/distribution-log.service';
import { Observable, catchError, tap } from 'rxjs';
import { MqUnrecoverableError } from '../../classes/mq-unrecoverable-error.class';
import { QUEUE_NAME } from '../../decorators/mq-interceptor-helper.decorator';
import { MessageDto } from '../../dto/message.dto';
import { DistributionJob } from '../../types/distribution-job.types';
import { MessageState } from '../../types/message-state.types';
import { getAttempts } from '../../utils/amqp.utils';

@Injectable()
export class MqInterceptor implements NestInterceptor {
  constructor(
    private readonly distributionLogService: DistributionLogService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  // Todo: Potentially refactor intercept method/catch database errors and log to console.
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const message: MessageDto = context.switchToRpc().getData();
    const amqpMsg: ConsumeMessage = context.switchToRpc().getContext();
    const queue = this.reflector.get<string>(QUEUE_NAME, context.getHandler());
    const distributionJob: DistributionJob = {
      queue,
      attemptsMade: getAttempts(amqpMsg, queue),
      processedAt: new Date(),
      finishedAt: null,
      ...message,
    };

    await this.distributionLogService.log(
      distributionJob,
      MessageState.ACTIVE,
      null,
      null,
    );

    return next.handle().pipe(
      tap(async (result) => {
        distributionJob.finishedAt = new Date();

        await this.distributionLogService.log(
          distributionJob,
          MessageState.COMPLETED,
          result,
          null,
        );
      }),
      catchError(async (error) => {
        distributionJob.finishedAt = new Date();

        await this.distributionLogService.log(
          distributionJob,
          MessageState.FAILED,
          null,
          error,
        );

        if (this._shouldRetry(error, amqpMsg, queue)) {
          return new Nack();
        }

        return;
      }),
    );
  }

  /**
   * Yields true if a message has not exceeded the max retry attempts and the error is
   * not an MqUnrecoverableError or false otherwise.
   * @param {Error} error
   * @param {ConsumeMessage} amqpMsg
   * @param {string} queue
   * @returns {boolean}
   */
  private _shouldRetry(
    error: Error,
    amqpMsg: ConsumeMessage,
    queue: string,
  ): boolean {
    return (
      !(error instanceof MqUnrecoverableError) &&
      getAttempts(amqpMsg, queue) < this.configService.get('RETRY_ATTEMPTS')
    );
  }
}
