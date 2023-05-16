import { SetMetadata } from '@nestjs/common';

export const QUEUE_NAME = 'queueName';

export const MqLogger = (queueName: string) =>
  SetMetadata(QUEUE_NAME, queueName);
