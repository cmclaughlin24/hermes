import { SetMetadata } from '@nestjs/common';
import { USE_OPEN_TELEMETRY } from '../constants/open-telemetry.constants';

export const OpenTelemetry = () => SetMetadata(USE_OPEN_TELEMETRY, true);
