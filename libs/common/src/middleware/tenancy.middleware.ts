import { NestMiddleware } from '@nestjs/common';

export const TENANCY_KEY = Symbol('tenantId');

export const TENANCY_HEADER = 'x-tenant-id';

export class TenancyMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: (error?: Error | any) => void) {
    const tenantId = req.headers[TENANCY_HEADER];

    if (tenantId) {
      req[TENANCY_KEY] = tenantId.toString();
    }

    next();
  }
}
