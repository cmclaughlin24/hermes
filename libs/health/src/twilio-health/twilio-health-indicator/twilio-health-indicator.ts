import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as Twilio from 'twilio';

export interface TwilioHealthIndicatorOptions {
  accountSid: string;
  authToken: string;
}

@Injectable()
export class TwilioHealthIndicator extends HealthIndicator {
  async pingCheck(
    key: string,
    options: TwilioHealthIndicatorOptions,
  ): Promise<HealthIndicatorResult> {
    const client = Twilio(options.accountSid, options.authToken);
    let pingError: Error;

    try {
      const response = await client.api.v2010
        .accounts(options.accountSid)
        .fetch();

      if (response.status !== 'active') {
        throw new Error(`Account ${options.accountSid} is ${response.status}`);
      }
    } catch (error) {
      pingError = error;
    }

    const result = this.getStatus(key, !pingError, {
      error: pingError?.message,
    });

    if (!pingError) {
      return result;
    }

    throw new HealthCheckError('Twilio Error', result);
  }
}
