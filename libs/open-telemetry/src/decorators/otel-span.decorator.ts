import { OTelSpanDecoratorOptions } from '../types/otel-span-decorator-options.type';
import { telemetryWrapper } from '../utils/open-telemetry.utils';

/**
 * Decorator that marks a method that should generate a [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans)
 * when executed. It implements a monkey patch to wrap the original method
 * call with the span [creation and closure](https://opentelemetry.io/docs/instrumentation/js/manual/#create-spans).
 * 
 * Note: If the `ENABLE_OPEN_TELEMETRY` environment variable is set to false,
 *       the telemetry wrapper won't be applied.
 * 
 * @param {OTelSpanDecoratorOptions} options
 * @returns {MethodDecorator}
 */
export const OTelSpan = (
  options?: OTelSpanDecoratorOptions,
): MethodDecorator => {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const method = descriptor.value;
    const spanOptions = {
      name: `${target.constructor.name}.${propertyKey}`,
      ...options,
    };

    descriptor.value = telemetryWrapper(method, spanOptions);
  };
};
