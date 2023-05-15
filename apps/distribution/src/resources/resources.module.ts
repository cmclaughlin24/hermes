import { ApiKeyGuard, RequestLoggerMiddleware } from '@hermes/common';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DistributionEventModule } from './distribution-event/distribution-event.module';
import { DistributionLogModule } from './distribution-log/distribution-log.module';
import { DistributionRuleModule } from './distribution-rule/distribution-rule.module';
import { MessageModule } from './message/message.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    DistributionLogModule,
    DistributionRuleModule,
    SubscriptionModule,
    MessageModule,
    DistributionEventModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
