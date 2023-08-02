import { SetMetadata } from '@nestjs/common';
import { USE_OPEN_TELEMETRY } from '../constants/open-telemetry.constants';

/**
 * Decorator that marks a provider or controller that should have it's methods
 * automatically wrapped with a [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans)
 * if `disableAutoDiscovery` is disabled.
 * 
 * Note: If a provider (non-injectable) or controller filtered out during automatic
 *       discovery the decorator can be used to provide the `OpenTelemetryService`
 *       with a hint that a provider or controller should be discovered.
 */
export const OpenTelemetry = () => SetMetadata(USE_OPEN_TELEMETRY, true);
