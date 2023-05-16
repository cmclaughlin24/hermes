import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConsumeMessage } from 'amqplib';
import { DistributionLogService } from 'apps/distribution/src/resources/distribution-log/distribution-log.service';
import { Observable, catchError, tap } from 'rxjs';
import { QUEUE_NAME } from '../../decorators/mq-logger.decorator';
import { MessageDto } from '../../dto/message.dto';
import { DistributionJob } from '../../types/distribution-job.types';
import { MessageState } from '../../types/message-state.types';
import { getAttempts } from '../../utils/amqp.utils';

@Injectable()
export class MqLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly distributionLogService: DistributionLogService,
    private readonly reflector: Reflector,
  ) {}

  // Todo: Potentially refactor intercept method.
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
      // Todo: Because Rabbitmq expects Nack() to be returned for failed messages,
      //       will need to come up with an option. (Rename logger interceptor and handle here?)
      catchError(async (error) => {
        distributionJob.finishedAt = new Date();

        await this.distributionLogService.log(
          distributionJob,
          MessageState.FAILED,
          null,
          error,
        );

        throw error;
      }),
    );
  }
}
