import { SpanOptions } from '@opentelemetry/api';
import { telemetryWrapper } from '../utils/open-telemetry.utils';

export const OTelSpan = (
  name?: string,
  options?: SpanOptions,
): MethodDecorator => {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const method = descriptor.value;
    const spanName = name || `${target.constructor.name}.${propertyKey}`;
    descriptor.value = telemetryWrapper(method, { name: spanName });
  };
};
