import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../../config/cache.config';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';
import { PhoneTemplateRepository } from './repository/phone-template.repository';
import { OrmPhoneTemplateRepository } from './repository/orm-phone-template.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneTemplate } from './repository/entities/phone-template.entity';

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
