import { RequestLoggerMiddleware } from '@hermes/common';
import { IamModule } from '@hermes/iam';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DistributionEventModule } from './distribution-event/distribution-event.module';
import { DistributionLogModule } from './distribution-log/distribution-log.module';
import { DistributionRuleModule } from './distribution-rule/distribution-rule.module';
import { HealthModule } from './health/health.module';
import { MessageModule } from './message/message.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    DistributionLogModule,
    DistributionRuleModule,
    SubscriptionModule,
    MessageModule,
    DistributionEventModule,
    HealthModule,
    IamModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKeyHeader: configService.get('API_KEY_HEADER'),
        apiKey: configService.get('API_KEY'),
      }),
    }),
  ],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
