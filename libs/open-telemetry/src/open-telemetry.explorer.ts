import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { UseOpenTelemetryOptions } from './types/use-open-telemetry-options.type';
import { telemetryWrapper } from './utils/open-telemetry.utils';

@Injectable()
export class OpenTelemetryExplorer {
  private readonly logger = new Logger(OpenTelemetryExplorer.name);

  constructor(
    @Inject(OPEN_TELEMETRY_OPTIONS_TOKEN)
    private readonly options: typeof OPEN_TELEMETRY_OPTIONS_TYPE,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  /**
   * Explores the application IoC container and configures discovered
   * controllers and providers to emit telemetry data.
   * @param {UseOpenTelemetryOptions} options
   */
  explore({ logging }: UseOpenTelemetryOptions) {
    if (!this.options.enableOpenTelemetry) {
      return;
    }

    logging && this.logger.log('Scanning Nest application for providers...');

    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance } = wrapper;
      const prototype = instance && Object.getPrototypeOf(instance);

      if (!instance || !prototype) {
        continue;
      }

      const useOpenTelemetry = this._useOpenTelemetry(instance);
      const isExcluded = this._isExcluded(instance);
      const isInjectable =
        this.reflector.get(INJECTABLE_WATERMARK, instance.constructor) ?? false;

      if (
        (!useOpenTelemetry && !isInjectable) ||
        (!this.options.disableAutoDiscovery && isExcluded)
      ) {
        continue;
      }

      this._wrapInstanceMethods(instance, prototype);

      logging &&
        this.logger.log(`${instance.constructor.name} telemetry initialized`);
    }

    logging && this.logger.log('Scanning Nest application for controllers...');

    const controllers = this.discoveryService.getControllers();

    for (const wrapper of controllers) {
      const { instance } = wrapper;
      const prototype = instance && Object.getPrototypeOf(instance);

      if (!instance || !prototype) {
        continue;
      }

      const useOpenTelemetry = this._useOpenTelemetry(instance);
      const isExcluded = this._isExcluded(instance);

      if (
        (this.options.disableAutoDiscovery && !useOpenTelemetry) ||
        (!this.options.disableAutoDiscovery && isExcluded)
      ) {
        continue;
      }

      this._wrapInstanceMethods(instance, prototype);

      logging &&
        this.logger.log(`${instance.constructor.name} telemetry initialized`);
    }
  }

  /**
   * Yields a boolean indicating whether or not a controller/provider instance
   * has the `USE_OPEN_TELEMETRY` metadata.
   * @param {any} instance
   * @returns {boolean}
   */
  private _useOpenTelemetry(instance: any) {
    return (
      this.reflector.get(USE_OPEN_TELEMETRY, instance.constructor) ?? false
    );
  }

  /**
   * Yields a boolean indicating whether or not a controller/provider instance
   * was excluded in the `OpenTelemetryModuleOptions`.
   * @param {any} instance
   * @returns {boolean}
   */
  private _isExcluded(instance: any) {
    return (
      this.options.excludes?.some(
        (cls) => cls.name === instance.constructor.name,
      ) ?? false
    );
  }

  /**
   * Wraps the original methods of the provider or controller instance with
   * the span [creation and closure](https://opentelemetry.io/docs/instrumentation/js/manual/#create-spans).
   * @param {any} instance
   * @param {any} prototype
   */
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
