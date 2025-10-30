import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../config/cache.config';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplateRepository } from './repository/email-template.repository';
import { OrmEmailTemplateRepository } from './repository/orm-email-template.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplateEntity } from './repository/entities/email-template.entity';
import { EmailTemplateProfile } from './profiles/email-template.profile';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplateEntity]),
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
      useClass: OrmEmailTemplateRepository,
    },
    EmailTemplateProfile,
  ],
  exports: [EmailTemplateService],
})
export class EmailTemplateModule {}
