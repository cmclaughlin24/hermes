import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { OpenTelemetryExplorer } from './open-telemetry.explorer';
import { OpenTelemetryModuleDefinitionClass } from './open-telemetry.module-definition';

@Module({
  imports: [DiscoveryModule],
  providers: [OpenTelemetryExplorer],
})
export class OpenTelemetryModule extends OpenTelemetryModuleDefinitionClass {}
