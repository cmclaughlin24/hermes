import { NestMiddleware } from '@nestjs/common';

export class TenancyMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: Error | any) => void) {
    throw new Error('Method not implemented.');
  }
}
