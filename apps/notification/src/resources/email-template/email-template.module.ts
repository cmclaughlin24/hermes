import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../../config/cache.config';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
  ],
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService],
  exports: [EmailTemplateService],
})
export class EmailTemplateModule {}
