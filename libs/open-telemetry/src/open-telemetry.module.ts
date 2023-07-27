import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { OpenTelemetryModuleDefinitionClass } from './open-telemetry.module-definition';
import { OpenTelemetryService } from './open-telemetry.service';

@Module({
  imports: [DiscoveryModule],
  providers: [OpenTelemetryService],
})
export class OpenTelemetryModule extends OpenTelemetryModuleDefinitionClass {}
