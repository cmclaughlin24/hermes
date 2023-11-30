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
  providers: [ApiKeyResolver, ApiKeyService],
})
export class ApiKeyModule {}
