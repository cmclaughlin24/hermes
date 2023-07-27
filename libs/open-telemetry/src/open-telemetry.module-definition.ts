import { ConfigurableModuleBuilder } from '@nestjs/common';

export const {
  ConfigurableModuleClass: OpenTelemetryModuleDefinitionClass,
  MODULE_OPTIONS_TOKEN: OPEN_TELEMETRY_OPTIONS_TOKEN,
  OPTIONS_TYPE: OPEN_TELEMETRY_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<{ disableAutoDiscovery?: boolean }>().build();
