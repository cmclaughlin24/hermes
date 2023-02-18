import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(req: any, res: any, next: () => void) {
    next();
  }
}
