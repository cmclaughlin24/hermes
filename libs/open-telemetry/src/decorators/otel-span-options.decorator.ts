import { SetMetadata } from '@nestjs/common';
import { OTEL_SPAN_OPTIONS } from '../constants/open-telemetry.constants';
import { OTelSpanDecoratorOptions } from '../types/otel-span-decorator-options.type';

export const OTelSpanOptions = (options: OTelSpanDecoratorOptions) =>
  SetMetadata(OTEL_SPAN_OPTIONS, options);
