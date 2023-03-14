import { ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bullmq';

export async function bullFactory(
  configService: ConfigService,
): Promise<QueueOptions> {
  return {
    connection: {
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
    },
    defaultJobOptions: {
      attempts: configService.get('RETRY_ATTEMPTS'),
      backoff: {
        type: 'exponential',
        delay: configService.get('RETRY_DELAY'),
      },
    },
  };
}
