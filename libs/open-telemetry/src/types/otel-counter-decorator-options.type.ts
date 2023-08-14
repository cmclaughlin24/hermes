import { MetricOptions } from '@opentelemetry/api';

export interface OTelCounterDecoratorOptions {
  /**
   * Name of the meter. It should uniquely identify the [instrumentation scope](https://opentelemetry.io/docs/specs/otel/metrics/api/#get-a-meter).
   */
  meterName: string;

  /**
   * Name of the [counter](https://opentelemetry.io/docs/specs/otel/metrics/api/#counter).
   */
  counterName: string;

  /**
   * Options needed for metric creation.
   */
  counterOptions?: MetricOptions;

  /**
   * A function that lets you attach key/value pairs to the metric as it is generated. Will recieve the
   * decorated method's arguments as a parameter.
   * @param {any[]} args Method's arguments
   * @returns {{ [key: string]: any }}
   */
  attrFn?: (...args: any[]) => { [key: string]: any };
}
