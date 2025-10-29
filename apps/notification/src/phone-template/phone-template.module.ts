import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { cacheFactory } from '../config/cache.config';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';
import { PhoneTemplateEntity } from './repository/entities/phone-template.entity';
import { OrmPhoneTemplateRepository } from './repository/orm-phone-template.repository';
import { PhoneTemplateRepository } from './repository/phone-template.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PhoneTemplateEntity]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
  ],
  controllers: [PhoneTemplateController],
  providers: [
    PhoneTemplateService,
    {
      provide: PhoneTemplateRepository,
      useClass: OrmPhoneTemplateRepository,
    },
  ],
  exports: [PhoneTemplateService],
})
export class PhoneTemplateModule {}
