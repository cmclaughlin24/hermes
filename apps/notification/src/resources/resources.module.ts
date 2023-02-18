import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { EmailTemplateModule } from './email-template/email-template.module';
import { NotificationJobModule } from './notification-job/notification-job.module';
import { NotificationLogModule } from './notification-log/notification-log.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    NotificationJobModule,
    NotificationLogModule,
    EmailTemplateModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class ResourcesModule {}
