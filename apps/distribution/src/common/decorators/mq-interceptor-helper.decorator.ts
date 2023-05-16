import { SetMetadata } from '@nestjs/common';

export const QUEUE_NAME = 'queueName';

export const MqInterceptorHelper = (queueName: string) =>
  SetMetadata(QUEUE_NAME, queueName);
