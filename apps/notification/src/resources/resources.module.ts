import { IamClientModule, IamClientService } from '@hermes/common';
import { IamModule } from '@hermes/iam';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { iamFactory } from '../config/iam.config';
import { EmailTemplateModule } from './email-template/email-template.module';
import { HealthModule } from './health/health.module';
import { NotificationJobModule } from './notification-job/notification-job.module';
import { NotificationLogModule } from './notification-log/notification-log.module';
import { NotificationModule } from './notification/notification.module';
import { PhoneTemplateModule } from './phone-template/phone-template.module';
import { PushTemplateModule } from './push-template/push-template.module';

@Module({
  imports: [
    NotificationModule,
    NotificationJobModule,
    NotificationLogModule,
    EmailTemplateModule,
    PhoneTemplateModule,
    PushTemplateModule,
    HealthModule,
    IamModule.registerAsync({
      imports: [ConfigModule, IamClientModule],
      inject: [ConfigService, IamClientService],
      useFactory: iamFactory,
    }),
  ],
})
export class ResourcesModule {}
