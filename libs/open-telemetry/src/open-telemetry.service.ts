import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { INJECTABLE_WATERMARK } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import {
  OTEL_SPAN_OPTIONS,
  USE_OPEN_TELEMETRY,
} from './constants/open-telemetry.constants';
import {
  OPEN_TELEMETRY_OPTIONS_TOKEN,
  OPEN_TELEMETRY_OPTIONS_TYPE,
} from './open-telemetry.module-definition';
import { telemetryWrapper } from './utils/open-telemetry.utils';

@Injectable()
export class OpenTelemetryService implements OnApplicationBootstrap {
  constructor(
    @Inject(OPEN_TELEMETRY_OPTIONS_TOKEN)
    private readonly options: typeof OPEN_TELEMETRY_OPTIONS_TYPE,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onApplicationBootstrap() {
    if (!this.options.enableOpenTelemetry) {
      return;
    }

    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance } = wrapper;
      const prototype = instance && Object.getPrototypeOf(instance);

      if (!instance || !prototype) {
        continue;
      }

      const useOpenTelemetry =
        this.reflector.get(USE_OPEN_TELEMETRY, instance.constructor) ?? false;
      const isInjectable =
        this.reflector.get(INJECTABLE_WATERMARK, instance.constructor) ?? false;

      if (
        !useOpenTelemetry &&
        (this.options.disableAutoDiscovery || !isInjectable)
      ) {
        continue;
      }

      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodKey of methodNames) {
        const spanOptions =
          this.reflector.get(OTEL_SPAN_OPTIONS, instance[methodKey]) ?? {};

        instance[methodKey] = telemetryWrapper(instance[methodKey], {
          name: `${instance.constructor.name}.${methodKey}`,
          ...spanOptions,
        });
      }
    }
  }
}
