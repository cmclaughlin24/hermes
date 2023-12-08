import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { cacheFactory } from '../../config/cache.config';
import { PushAction } from './entities/push-action.entity';
import { PushTemplate } from './entities/push-template.entity';
import { PushTemplateController } from './push-template.controller';
import { PushTemplateService } from './push-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushTemplate, PushAction]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
  ],
  controllers: [PushTemplateController],
  providers: [PushTemplateService],
  exports: [PushTemplateService],
})
export class PushTemplateModule {}
