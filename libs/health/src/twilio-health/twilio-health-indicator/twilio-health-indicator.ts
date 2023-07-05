import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as Twilio from 'twilio';

export interface TwilioHealthIndicatorOptions {
  accountSid: string;
  authToken: string;
}

@Injectable()
export class TwilioHealthIndicator extends HealthIndicator {
  /**
   * Checks if Twilio responds and returns an account instance that has a status of active.
   * @param {string} key The key which will be used for the result object
   * @param {TwilioHealthIndicatorOptions} options The options for the ping
   * @returns {Promise<HealthIndicatorResult>}
   */
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
