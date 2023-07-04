import { Public, RedisHealthIndicator } from '@hermes/common';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly sequelizeIndicator: SequelizeHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: "Check the status of the application and it's dependencies.",
    security: [],
  })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.sequelizeIndicator.pingCheck('database'),
      () => this.redisIndicator.pingCheck('redis'),
    ]);
  }
}
