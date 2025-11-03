import { RedisHealthModule } from '@hermes/health';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { Cluster } from 'ioredis';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    RedisHealthModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Todo: Move useFactory method into a configuration file.
        const host = configService.get('REDIS_HOST');
        const port = configService.get('REDIS_PORT');
        const commandTimeout = configService.get('REDIS_COMMAND_TIMEOUT');

        if (configService.get('ENABLE_REDIS_CLUSTER')) {
          return new Cluster([{ host, port }], {
            enableOfflineQueue: false,
            redisOptions: { commandTimeout: 1000 },
          });
        }

        return { host, port };
      },
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
