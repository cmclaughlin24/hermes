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

      const useOpenTelemetry = this._useOpenTelemetry(instance);
      const isInjectable =
        this.reflector.get(INJECTABLE_WATERMARK, instance.constructor) ?? false;

      if (
        !useOpenTelemetry &&
        (this.options.disableAutoDiscovery || !isInjectable)
      ) {
        continue;
      }

      this._wrapInstanceMethods(instance, prototype);
    }

    const controllers = this.discoveryService.getControllers();

    for (const wrapper of controllers) {
      const { instance } = wrapper;
      const prototype = instance && Object.getPrototypeOf(instance);

      if (!instance || !prototype) {
        continue;
      }

      const useOpenTelemetry = this._useOpenTelemetry(instance);

      if (this.options.disableAutoDiscovery && !useOpenTelemetry) {
        continue;
      }

      this._wrapInstanceMethods(instance, prototype);
    }
  }

  private _useOpenTelemetry(instance: any) {
    return (
      this.reflector.get(USE_OPEN_TELEMETRY, instance.constructor) ?? false
    );
  }

  private _wrapInstanceMethods(instance: any, prototype: any) {
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
