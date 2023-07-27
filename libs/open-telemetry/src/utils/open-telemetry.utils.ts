import { SpanStatusCode, trace } from '@opentelemetry/api';
import { IS_TELEMETRY_WRAPPED } from '../constants/open-telemetry.constants';

export function telemetryWrapper(method: Function, options: any): Function {
  const isTelemetryWrapped = Reflect.getMetadata(IS_TELEMETRY_WRAPPED, method);

  if (isTelemetryWrapped) {
    return method;
  }

  const wrappedMethod = function (...args: any[]) {
    const tracer = trace.getTracer('default');
    const name = options.name;

    return tracer.startActiveSpan(name, (span) => {
      switch (method.constructor.name) {
        case 'Function':
          try {
            return method.apply(this, args);
          } catch (error) {
            recordException(span, error);
            throw error;
          } finally {
            span.end();
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
  Reflect.defineMetadata(IS_TELEMETRY_WRAPPED, true, wrappedMethod);

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
