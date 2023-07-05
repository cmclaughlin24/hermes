import { TwilioHealthIndicatorOptions } from '@hermes/health/twilio-health/twilio-health-indicator/twilio-health-indicator';
import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import * as amqplib from 'amqplib';

export interface RabbitMQHealthIndicatorOptions {
  uri: string;
}

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  /**
   * Checks if the RabbitMQ server responds and returns a connection instance.
   * @param {string} key The key which will be used for the result object
   * @param {TwilioHealthIndicatorOptions} options The options for the ping
   * @returns {Promise<HealthIndicatorResult>}
   */
  async pingCheck(
    key: string,
    options: RabbitMQHealthIndicatorOptions,
  ): Promise<HealthIndicatorResult> {
    let pingError: Error;
    let connection;

    try {
      connection = await amqplib.connect(options.uri);
    } catch (error) {
      pingError = error;
    } finally {
      // ? Should this remain in the finally block or should it be promoted
      //   to the try block?
      await connection?.close();
    }

    const result = this.getStatus(key, !pingError, {
      error: pingError?.message,
    });

    if (!pingError) {
      return result;
    }

    throw new HealthCheckError('RabbitMQ Error', result);
  }
}
