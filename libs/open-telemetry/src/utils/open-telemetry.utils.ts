import { SpanStatusCode, trace } from '@opentelemetry/api';

export function telemetryWrapper(method: Function, options: any): Function {
  const tracer = trace.getTracer('default');
  const name = options.name;

  const wrappedMethod = function (...args: any[]) {
    return tracer.startActiveSpan(name, (span) => {
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
            `Invalid Argument: Cannot identify how to wrap function=${method.name} type=${method.constructor.name}`,
          );
      }
    });
  };
  
  copyMetadata(method, wrappedMethod);

  return wrappedMethod;
}

function recordException(span: any, error: Error) {
  span.recordException(error);
  span.setStatus({ status: SpanStatusCode.ERROR, message: error.message });
}

function copyMetadata(original: Object, copy: Object) {
  Reflect.getMetadataKeys(original).forEach((key) => {
    Reflect.defineMetadata(key, Reflect.getMetadata(key, original), copy);
  });
}
