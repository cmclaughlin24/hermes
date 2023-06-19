import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

export async function cacheFactory(
  configService: ConfigService,
): Promise<CacheModuleOptions> {
  const host = configService.get('REDIS_HOST');
  const port = configService.get('REDIS_PORT');
  const commandTimeout = configService.get('REDIS_COMMAND_TIMEOUT');
  let options: any = { host, port, commandTimeout };

  if (configService.get('ENABLE_REDIS_CLUSTER')) {
    options = {
      clusterConfig: {
        nodes: [{ host, port }],
        redisOptions: { commandTimeout },
      },
    };
  }

  return {
    store: await redisStore(options),
  };
}
