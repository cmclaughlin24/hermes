import { Module } from '@nestjs/common';
import { TwilioHealthIndicator } from './twilio-health-indicator/twilio-health-indicator';

@Module({
  providers: [TwilioHealthIndicator],
  exports: [TwilioHealthIndicator],
})
export class TwilioHealthModule {}
