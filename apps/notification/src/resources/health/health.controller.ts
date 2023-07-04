import { Public, RedisHealthIndicator } from '@hermes/common';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly sequelizeIndicator: SequelizeHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly httpIndicator: HttpHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: "Check the status of the application and it's dependencies.",
    security: [],
  })
  @HealthCheck()
  check() {
    // Todo: Add health checks for Twilio.
    return this.health.check([
      () => this.sequelizeIndicator.pingCheck('database'),
      () => this.redisIndicator.pingCheck('redis'),
      // Note: Health check for Send Grid is to verify the validity of the API Key.
      // Fixme: Move URL for verifying API Key to environment.
      () =>
        this.httpIndicator.pingCheck('send-grid', 'https://api.sendgrid.com/v3/scopes', {
          headers: { Authorization: `Bearer ${this.configService.get('MAILER_PASSWORD')}` },
        }),
    ]);
  }
}
