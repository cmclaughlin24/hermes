export interface OpenTelemetryModuleOptions {
  /**
   * Enable the Open Telemetry instrumentation so that traces,
   * metrics, and logs are emitted from discovered providers. To
   * disable methods decorated with the `@OTelSpan` decorator, set
   * the `ENABLE_OPEN_TELEMETRY` environment variable to false.
   */
  enableOpenTelemetry: boolean;

  /**
   * Disable the automatic discovery of providers and only
   * capture telemetry from providers/functions decorated w/
   * `@OpenTelemetry` or `@OTelSpan`.
   */
  disableAutoDiscovery?: boolean;
}
