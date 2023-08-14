import { metrics } from '@opentelemetry/api';
import { OTelCounterDecoratorOptions } from '../types/otel-counter-decorator-options.type';
import { copyMetadata } from '../utils/open-telemetry.utils';

/**
 * Decorator that marks a method that should measure the number of method executions over time
 * using a [synchronous counter](https://opentelemetry.io/docs/instrumentation/js/manual/#using-counters).
 * This can be helpful for calculating the rate at which events processed over a period.
 * 
 * Note: If the `ENABLE_OPEN_TELEMETRY` environment variable is set to false,
 *       the telemetry wrapper won't be applied.
 * 
 * @param {OTelCounterDecoratorOptions} options
 * @returns {MethodDecorator}
 */
export const OTelCounter = (
  options: OTelCounterDecoratorOptions,
): MethodDecorator => {
  return (
    _target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    if (!process.env.ENABLE_OPEN_TELEMETRY) {
      return;
    }

    const method = descriptor.value;
    const meter = metrics.getMeter(options.meterName);
    const counter = meter.createCounter(
      options.counterName,
      options.counterOptions,
    );

    const { [propertyKey]: wrappedMethod } = {
      [propertyKey]: function (...args: any[]) {
        const attributes = options.attrFn ? options.attrFn(args) : null;
        counter.add(1, attributes);
        return method.apply(this, args);
      },
    };

    copyMetadata(method, wrappedMethod);
    descriptor.value = wrappedMethod;
  };
};
