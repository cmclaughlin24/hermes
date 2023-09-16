import { RequestLoggerMiddleware } from '@hermes/common';
import { IamModule } from '@hermes/iam';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
    IamModule.register(),
  ],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
