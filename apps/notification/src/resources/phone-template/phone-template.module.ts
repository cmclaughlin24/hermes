import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../../config/cache.config';
import { OrmDataSourceService } from '../../core/services/orm-data-source.service';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';
import { PhoneTemplateRepository } from './repository/phone-template.repository';
import { OrmPhoneTemplateRepository } from './repository/orm-phone-template.repository';
import { PhoneTemplate } from './repository/entities/phone-template.entity';

@Module({
  imports: [
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
      inject: [OrmDataSourceService],
      useFactory: (dataSource: OrmDataSourceService) =>
        new OrmPhoneTemplateRepository(dataSource.getRepository(PhoneTemplate)),
    },
  ],
  exports: [PhoneTemplateService],
})
export class PhoneTemplateModule {}
