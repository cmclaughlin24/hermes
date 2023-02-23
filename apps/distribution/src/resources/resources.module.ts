import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard, RequestLoggerMiddleware } from '@notification/common';
import { DistributionLogModule } from './distribution-log/distribution-log.module';
import { DistributionJobModule } from './distribution-job/distribution-job.module';
import { DistributionRulesModule } from './distribution-rules/distribution-rules.module';

@Module({
  imports: [DistributionLogModule, DistributionJobModule, DistributionRulesModule],
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
