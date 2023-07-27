import { SetMetadata } from '@nestjs/common';
import { OTEL_SPAN_OPTIONS } from '../constants/open-telemetry.constants';

export const OTelSpanOptions = (options: any) =>
  SetMetadata(OTEL_SPAN_OPTIONS, options);
