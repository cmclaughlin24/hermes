export interface OpenTelemetryModuleOptions {
  /**
   * Disable the automatic discovery of providers and only 
   * capture telemetry from providers/functions decorated w/
   * `@OpenTelemetry` or `@OTelSpan`. 
   */
  disableAutoDiscovery?: boolean;
}
