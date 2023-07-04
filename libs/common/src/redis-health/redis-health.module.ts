import { Module } from '@nestjs/common';
import { RedisHealthIndicator } from './redis-health-indicator/redis-health-indicator';
import { RedisModuleDefinitionClass } from './redis-health.module-definition';

@Module({
  providers: [RedisHealthIndicator],
  exports: [RedisHealthIndicator],
})
export class RedisHealthModule extends RedisModuleDefinitionClass {}
