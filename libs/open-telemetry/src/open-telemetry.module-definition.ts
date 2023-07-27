import { ConfigurableModuleBuilder } from '@nestjs/common';
import { OpenTelemetryModuleOptions } from './types/open-telemetry-module-options.type';

export const {
  ConfigurableModuleClass: OpenTelemetryModuleDefinitionClass,
  MODULE_OPTIONS_TOKEN: OPEN_TELEMETRY_OPTIONS_TOKEN,
  OPTIONS_TYPE: OPEN_TELEMETRY_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<OpenTelemetryModuleOptions>().build();
