import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { TENANCY_KEY } from '../middleware/tenancy.middleware';

/**
 * Extracts the `tenantId` property from the `req` object and populates the decorated
 * parameter with the value.
 *
 * Example:
 * ```typescript
 * get(@Tenant() tenantId: string)
 * ```
 */
export const Tenant = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    let request: any;

    if (context.getType<GqlContextType>() === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req;
    } else {
      request = context.switchToHttp().getRequest<Request>();
    }

    return request[TENANCY_KEY];
  },
);
