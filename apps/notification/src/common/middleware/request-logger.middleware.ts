import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(req: Request, res: Response, next: () => void) {
    const { method, originalUrl } = req;
    const startTime = new Date().getTime();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = new Date().getTime() - startTime;

      this.logger.log(
        `Method=${method} URL=${originalUrl} Status=${statusCode} ResponseTime=${responseTime}ms`,
      );
    });

    next();
  }
}
