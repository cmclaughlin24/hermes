import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard, RequestLoggerMiddleware } from '@notification/common';

@Module({
  imports: [],
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
