import { RequestLoggerMiddleware } from '@hermes/common';
import { IamModule } from '@hermes/iam';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKeyHeader: configService.get('API_KEY_HEADER'),
        apiKeys: configService.get('API_KEY'),
      }),
    }),
  ],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
