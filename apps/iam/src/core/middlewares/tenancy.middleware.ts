import { NestMiddleware } from '@nestjs/common';

export const TENANCY_KEY = 'tenantId';

export class TenancyMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: (error?: Error | any) => void) {
    const tenantId = req.headers['x-tenant-id'];

    if (tenantId) {
      req[TENANCY_KEY] = tenantId.toString();
    }

    next();
  }
}
