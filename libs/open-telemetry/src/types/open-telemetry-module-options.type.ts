
export interface OpenTelemetryModuleOptions {
  /**
   * Enable the Open Telemetry instrumentation so that traces,
   * metrics, and logs are emitted from discovered controllers
   * and providers. To disable methods decorated with the `@OTelSpan`
   * decorator, set the `ENABLE_OPEN_TELEMETRY` environment
   * variable to false.
   */
  enableOpenTelemetry: boolean;

  /**
   * Disable the automatic discovery of providers and controllers.
   * Only capture telemetry from providers/methods decorated w/
   * `@OpenTelemetry` or `@OTelSpan`.
   */
  disableAutoDiscovery?: boolean;

  /**
   * Exclude providers or controllers from automatic discovery.
   * 
   * Note: Excluded classes with `@OTelSpan` decorated methods wil
   *        still produce telemetry.
   */
  excludes?: any[];
}
