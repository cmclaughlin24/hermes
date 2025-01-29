import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../../config/cache.config';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplateRepository } from './repository/email-template.repository';
import { OrmEmailTemplateRepository } from './repository/orm-email-template.repository';
import { OrmDataSourceService } from '../../core/services/orm-data-source.service';
import { EmailTemplate } from './repository/entities/email-template.entity';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
  ],
  controllers: [EmailTemplateController],
  providers: [
    EmailTemplateService,
    {
      provide: EmailTemplateRepository,
      inject: [OrmDataSourceService],
      useFactory: (dataSource: OrmDataSourceService) =>
        new OrmEmailTemplateRepository(dataSource.getRepository(EmailTemplate)),
    },
  ],
  exports: [EmailTemplateService],
})
export class EmailTemplateModule {}
