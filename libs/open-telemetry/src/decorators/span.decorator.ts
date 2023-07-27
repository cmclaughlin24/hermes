import { SpanOptions, SpanStatusCode, trace } from '@opentelemetry/api';

export const Span = (name?: string, options?: SpanOptions): MethodDecorator => {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const method = descriptor.value;
    const wrappedMethod = function (...args: any) {
      const tracer = trace.getTracer('default');
      const spanName = name || `${target.constructor.name}.${propertyKey}`;
      return tracer.startActiveSpan(spanName, (span) => {
        switch (method.constructor.name) {
          case 'Function':
            try {
              return method.apply(this, args);
            } catch (error) {
              recordException(span, error);
              throw error;
            }
          case 'AsyncFunction':
            return method
              .apply(this, args)
              .catch((error) => {
                recordException(span, error);
                throw error;
              })
              .finally(() => {
                span.end();
              });
          default:
            throw new Error(
              `Invalid Argument: Cannot identify how to wrap function=${propertyKey} type=${method.constructor.name}`,
            );
        }
      });
    };

    descriptor.value = wrappedMethod;
    copyMetadata(method, wrappedMethod);
  };
};

function copyMetadata(original: Object, copy: Object) {
  Reflect.getMetadataKeys(original).forEach((key) => {
    Reflect.defineMetadata(key, Reflect.getMetadata(key, original), copy);
  });
}

function recordException(span: any, error: Error) {
  span.recordException(error);
  span.setStatus({ status: SpanStatusCode.ERROR, message: error.message });
}
