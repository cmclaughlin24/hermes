import { INestApplication } from '@nestjs/common';
import { Span, SpanStatusCode, trace } from '@opentelemetry/api';
import { IS_TELEMETRY_WRAPPED } from '../constants/open-telemetry.constants';
import { OpenTelemetryExplorer } from '../open-telemetry.explorer';
import { OTelSpanDecoratorOptions } from '../types/otel-span-decorator-options.type';
import { UseOpenTelemetryOptions } from '../types/use-open-telemetry-options.type';

/**
 * Initializes the `OpenTelemetryModule` instrumentation so that
 * traces, metrics, and logs are emitted from discovered controllers
 * and providers.
 *
 * Note: Must occur before `app.listen` excutes the Nest `RouteExplorer`
 *       and stores a reference value for each controllers' methods.
 *
 * @param {INestApplication} app
 * @param {UseOpenTelemetryOptions} options
 */
export function useOpenTelemetry(
  app: INestApplication,
  options: UseOpenTelemetryOptions = {},
) {
  const explorer = app.get(OpenTelemetryExplorer);
  explorer.explore(options);
}

/**
 * Yields a copy of the function that has been wrapped with the
 * span [creation and closure](https://opentelemetry.io/docs/instrumentation/js/manual/#create-spans).
 * @param {Function} method
 * @param {OTelSpanDecoratorOptions} options
 * @returns {Function}
 */
export function telemetryWrapper(
  method: Function,
  options: OTelSpanDecoratorOptions = {},
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
      const name = options.name || method.name;
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

/**
 * Sets the exception as a span event and updates the span status to
 * `SpanStatusCode.ERROR`.
 * @param {Span} span
 * @param {Error} error
 */
function recordException(span: Span, error: Error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
}

/**
 * Copies the metadata key-value pairs from the original object to the
 * target object.
 * @param {object} original
 * @param {object} target
 */
function copyMetadata(original: object, target: object) {
  Reflect.getMetadataKeys(original).forEach((key) => {
    Reflect.defineMetadata(key, Reflect.getMetadata(key, original), target);
  });
}
