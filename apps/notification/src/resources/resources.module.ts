import { RequestLoggerMiddleware } from '@hermes/common';
import { IamModule } from '@hermes/iam';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
    IamModule,
  ],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
