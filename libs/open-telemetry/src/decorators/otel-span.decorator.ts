import { OTelSpanDecoratorOptions } from '../types/otel-span-decorator-options.type';
import { telemetryWrapper } from '../utils/open-telemetry.utils';

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
      name: `${target.constructor.name}.$${propertyKey}`,
      ...options,
    };

    descriptor.value = telemetryWrapper(method, spanOptions);
  };
};
