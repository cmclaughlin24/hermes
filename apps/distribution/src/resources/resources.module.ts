import {
  IamAccessTokenService,
  IamClientModule,
  RequestLoggerMiddleware,
} from '@hermes/common';
import { IamModule } from '@hermes/iam';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { iamFactory } from '../config/iam.config';
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
      imports: [ConfigModule, IamClientModule],
      inject: [ConfigService, IamAccessTokenService],
      useFactory: iamFactory,
    }),
  ],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
