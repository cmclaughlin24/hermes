import { INestApplication } from '@nestjs/common';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { IS_TELEMETRY_WRAPPED } from '../constants/open-telemetry.constants';
import { OpenTelemetryService } from '../open-telemetry.service';
import { OTelSpanDecoratorOptions } from '../types/otel-span-decorator-options.type';

export function useOpenTelemetry(app: INestApplication) {
  const telemetryService = app.get(OpenTelemetryService);
  telemetryService.init();
}

export function telemetryWrapper(
  method: Function,
  options: OTelSpanDecoratorOptions,
): Function {
  const isTelemetryWrapped = Reflect.getMetadata(IS_TELEMETRY_WRAPPED, method);

  if (isTelemetryWrapped || !process.env.ENABLE_OPEN_TELEMETRY) {
    return method;
  }

  // Note: Creation of wrapped method in an object with key of the method name
  //       ensures wrapped method maintains name after wrapping.
  const { [method.name]: wrappedMethod } = {
    [method.name]: function (...args: any[]) {
      const tracer = trace.getTracer('default');
      const name = options.name;
      const spanOptions = options ?? {};

      return tracer.startActiveSpan(name, spanOptions, (span) => {
        if (method.constructor.name === 'AsyncFunction') {
          return method
            .apply(this, args)
            .catch((error) => {
              recordException(span, error);
              throw error;
            })
            .finally(() => {
              span.end();
            });
        }

        // Bug: A function that returns a Promise object will be wrapped as a
        //      synchronous function if it is not marked with the async key word.
        try {
          return method.apply(this, args);
        } catch (error) {
          recordException(span, error);
          throw error;
        } finally {
          span.end();
        }
      });
    },
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
