import { ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bullmq';
import Redis from 'ioredis';

export async function bullFactory(
  configService: ConfigService,
): Promise<QueueOptions> {
  const host = configService.get('REDIS_HOST');
  const port = configService.get('REDIS_PORT');
  let connection: any = { host, port };

  if (configService.get('ENABLE_REDIS_CLUSTER')) {
    // Note: Redis requires one start up node and will use it to identify other nodes
    //       within the cluster. 
    connection = new Redis.Cluster([{ host, port }]);
  }

  return {
    connection,
    defaultJobOptions: {
      attempts: configService.get('RETRY_ATTEMPTS'),
      backoff: {
        type: 'exponential',
        delay: configService.get('RETRY_DELAY'),
      },
    },
  };
}
