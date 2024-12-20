import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../../config/cache.config';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
  ],
  controllers: [PhoneTemplateController],
  providers: [PhoneTemplateService],
  exports: [PhoneTemplateService],
})
export class PhoneTemplateModule {}
