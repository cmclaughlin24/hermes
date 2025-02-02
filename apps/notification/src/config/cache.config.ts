import { CacheModuleOptions } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KeyvRedis, { createCluster, Keyv } from '@keyv/redis';

export async function cacheFactory(
  configService: ConfigService,
): Promise<CacheModuleOptions> {
  const url = `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`;
  const commandTimeout = configService.get('CACHE_COMMAND_TIMEOUT');
  let store = new KeyvRedis({
    url,
    disableOfflineQueue: true,
  });

  if (configService.get('ENABLE_REDIS_CLUSTER')) {
    const cluster = createCluster({
      rootNodes: [{ url }],
      defaults: {
        disableOfflineQueue: true,
      },
      useReplicas: true,
    });

    store = new KeyvRedis(cluster);
  }

  const keyv = new Keyv({ store });
  const logger = new Logger(Keyv.name);

  keyv.on('error', (error) => {
    logger.error(error.toString());
  });

  return {
    stores: [keyv],
  };
}
