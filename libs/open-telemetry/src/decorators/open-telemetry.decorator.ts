import { SetMetadata } from '@nestjs/common';

export const USE_OPEN_TELEMETRY = 'useOpenTelemetry';

export const OpenTelemetry = () => SetMetadata(USE_OPEN_TELEMETRY, true);
