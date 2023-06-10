import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { cacheFactory } from '../../config/cache.config';
import { PhoneTemplate } from './entities/phone-template.entity';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';

@Module({
  imports: [
    SequelizeModule.forFeature([PhoneTemplate]),
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
