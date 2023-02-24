import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard, RequestLoggerMiddleware } from '@notification/common';
import { DistributionJobModule } from './distribution-job/distribution-job.module';
import { DistributionLogModule } from './distribution-log/distribution-log.module';
import { DistributionRuleModule } from './distribution-rule/distribution-rule.module';

@Module({
  imports: [
    DistributionLogModule,
    DistributionJobModule,
    DistributionRuleModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
