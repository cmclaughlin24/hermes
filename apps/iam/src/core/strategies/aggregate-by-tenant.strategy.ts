import {
  ContextId,
  ContextIdResolver,
  ContextIdResolverFn,
  ContextIdStrategy,
} from '@nestjs/core';

export class AggregateByTenantStrategy implements ContextIdStrategy {
  attach(
    contextId: ContextId,
    request: any,
  ): ContextIdResolverFn | ContextIdResolver | undefined {
    throw new Error('Method not implemented.');
  }
}
