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
  private readonly tenants = new Map<string, ContextId>();

  attach(
    contextId: ContextId,
    request: any,
  ): ContextIdResolverFn | ContextIdResolver | undefined {
    const tenantId = request.req[TENANCY_KEY] as string;

    if (!tenantId) {
      return () => contextId;
    }

    let tenantSubTreeId: ContextId;

    if (this.tenants.has(tenantId)) {
      tenantSubTreeId = this.tenants.get(tenantId);
    } else {
      tenantSubTreeId = ContextIdFactory.create();
      this.tenants.set(tenantId, tenantSubTreeId);
    }

    return {
      payload: { tenantId },
      resolve: (info: HostComponentInfo) =>
        info.isTreeDurable ? tenantSubTreeId : contextId,
    };
  }
}
