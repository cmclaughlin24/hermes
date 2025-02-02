import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { cacheFactory } from '../../config/cache.config';
import { PermissionModule } from '../permission/permission.module';
import { ApiKeyResolver } from './api-key.resolver';
import { ApiKeyService } from './api-key.service';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeyRepository } from './repository/api-key.repository';
import { OrmApiKeyRepository } from './repository/orm-api-key.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
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
    { provide: ApiKeyRepository, useClass: OrmApiKeyRepository },
  ],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
