import { SetMetadata } from '@nestjs/common';
import { OTEL_SPAN_OPTIONS } from '../constants/open-telemetry.constants';
import { OTelSpanDecoratorOptions } from '../types/otel-span-decorator-options.type';

/**
 * Decorator that sets the options that should be passed when a [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans)
 * is created for a method.
 * @param {OTelSpanDecoratorOptions} options
 */
export const OTelSpanOptions = (options: OTelSpanDecoratorOptions) =>
  SetMetadata(OTEL_SPAN_OPTIONS, options);
