import {
  Public,
  RabbitMQHealthIndicator,
  RabbitMQHealthIndicatorOptions,
  RedisHealthIndicator,
} from '@hermes/common';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    private readonly sequelizeIndicator: SequelizeHealthIndicator,
    private readonly rabbitmqIndicator: RabbitMQHealthIndicator,
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
    const rabbitmqOptions: RabbitMQHealthIndicatorOptions = {
      uri: this.configService.get('RABBITMQ_URI'),
    };

    return this.health.check([
      () => this.sequelizeIndicator.pingCheck('database'),
      () => this.rabbitmqIndicator.pingCheck('rabbitmq', rabbitmqOptions),
      () => this.redisIndicator.pingCheck('redis'),
    ]);
  }
}
