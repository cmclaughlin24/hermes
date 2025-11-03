import { RedisHealthIndicator } from '@hermes/health';
import { Auth, AuthType } from '@hermes/iam';
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly typeOrmIndicator: TypeOrmHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
  ) {}

  @Get()
  @Auth(AuthType.NONE)
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.typeOrmIndicator.pingCheck('database'),
      () => this.redisIndicator.pingCheck('redis'),
    ]);
  }
}
