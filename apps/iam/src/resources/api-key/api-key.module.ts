import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { CommonModule } from '../../common/common.module';
import { cacheFactory } from '../../config/cache.config';
import { DATA_SOURCE } from '../../core/core.module';
import { PermissionModule } from '../permission/permission.module';
import { ApiKeyResolver } from './api-key.resolver';
import { ApiKeyService } from './api-key.service';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeyRepository } from './repository/api-key.repository';
import { OrmApiKeyRepository } from './repository/orm-api-key.repository';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
    CommonModule,
    PermissionModule,
  ],
  providers: [
    ApiKeyResolver,
    ApiKeyService,
    {
      provide: ApiKeyRepository,
      inject: [DATA_SOURCE],
      useFactory: (dataSource: DataSource) =>
        new OrmApiKeyRepository(dataSource.getRepository(ApiKey)),
    },
  ],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
