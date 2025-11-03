import {
  RabbitMQHealthIndicator,
  RabbitMQHealthIndicatorOptions,
  RedisHealthIndicator,
} from '@hermes/health';
import { Auth, AuthType } from '@hermes/iam';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    private readonly typeOrmIndicator: TypeOrmHealthIndicator,
    private readonly rabbitmqIndicator: RabbitMQHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
  ) {}

  @Get()
  @Auth(AuthType.NONE)
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
      () => this.typeOrmIndicator.pingCheck('database'),
      () => this.rabbitmqIndicator.pingCheck('rabbitmq', rabbitmqOptions),
      () => this.redisIndicator.pingCheck('redis'),
    ]);
  }
}
