import {
  RedisHealthIndicator,
  TwilioHealthIndicator,
  TwilioHealthIndicatorOptions,
} from '@hermes/health';
import { Auth, AuthType } from '@hermes/iam';
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
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    private readonly httpIndicator: HttpHealthIndicator,
    private readonly sequelizeIndicator: SequelizeHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly twilioIndicator: TwilioHealthIndicator,
  ) {}

  @Get()
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: "Check the status of the application and it's dependencies.",
    security: [],
  })
  @HealthCheck()
  check() {
    const twilioOptions: TwilioHealthIndicatorOptions = {
      accountSid: this.configService.get('TWILIO_SID'),
      authToken: this.configService.get('TWILIO_AUTH_TOKEN'),
    };
    const mailerPassword = this.configService.get('MAILER_PASSWORD');

    return this.health.check([
      () => this.sequelizeIndicator.pingCheck('database'),
      () => this.redisIndicator.pingCheck('redis'),
      () => this.twilioIndicator.pingCheck('twilio', twilioOptions),
      // Note: Health check for Send Grid is to verify the validity of the API Key.
      // Fixme: Move URL for verifying API Key to environment.
      () =>
        this.httpIndicator.pingCheck(
          'send-grid',
          'https://api.sendgrid.com/v3/scopes',
          {
            headers: {
              Authorization: `Bearer ${mailerPassword}`,
            },
          },
        ),
    ]);
  }
}
