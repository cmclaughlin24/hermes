import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { cacheFactory } from '../../config/cache.config';
import { PhoneTemplate } from './entities/phone-template.entity';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PhoneTemplate]),
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
