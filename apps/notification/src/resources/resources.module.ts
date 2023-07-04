import { ApiKeyGuard, RequestLoggerMiddleware } from '@hermes/common';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EmailTemplateModule } from './email-template/email-template.module';
import { NotificationJobModule } from './notification-job/notification-job.module';
import { NotificationLogModule } from './notification-log/notification-log.module';
import { NotificationModule } from './notification/notification.module';
import { PhoneTemplateModule } from './phone-template/phone-template.module';
import { PushTemplateModule } from './push-template/push-template.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    NotificationModule,
    NotificationJobModule,
    NotificationLogModule,
    EmailTemplateModule,
    PhoneTemplateModule,
    PushTemplateModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
