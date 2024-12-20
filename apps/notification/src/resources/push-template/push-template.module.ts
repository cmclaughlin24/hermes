import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../../config/cache.config';
import { PushTemplateController } from './push-template.controller';
import { PushTemplateService } from './push-template.service';

@Module({
  imports: [
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
