import { ConfigurableModuleBuilder } from '@nestjs/common';
import { Cluster, RedisOptions } from 'ioredis';

export const {
  ConfigurableModuleClass: RedisModuleDefinitionClass,
  MODULE_OPTIONS_TOKEN: REDIS_OPTIONS_TOKEN,
  OPTIONS_TYPE: REDIS_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<
  { host: string; port: number, options?: RedisOptions } | Cluster
>().build();
