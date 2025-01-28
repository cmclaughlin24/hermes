import {
  ContextId,
  ContextIdFactory,
  ContextIdResolver,
  ContextIdResolverFn,
  ContextIdStrategy,
  HostComponentInfo,
} from '@nestjs/core';
import { TENANCY_KEY } from '../middlewares/tenancy.middleware';

export class AggregateByTenantStrategy implements ContextIdStrategy {
  private static readonly tenants = new Map<string, ContextId>();

  static get(tenantId: string) {
    return AggregateByTenantStrategy.tenants.get(tenantId);
  }

  attach(
    contextId: ContextId,
    request: any,
  ): ContextIdResolverFn | ContextIdResolver | undefined {
    const tenantId = request.req[TENANCY_KEY] as string;

    if (!tenantId) {
      return () => contextId;
    }

    let tenantSubTreeId: ContextId;

    if (AggregateByTenantStrategy.tenants.has(tenantId)) {
      tenantSubTreeId = AggregateByTenantStrategy.tenants.get(tenantId);
    } else {
      tenantSubTreeId = ContextIdFactory.create();
      AggregateByTenantStrategy.tenants.set(tenantId, tenantSubTreeId);
    }

    return {
      payload: { tenantId },
      resolve: (info: HostComponentInfo) =>
        info.isTreeDurable ? tenantSubTreeId : contextId,
    };
  }
}
