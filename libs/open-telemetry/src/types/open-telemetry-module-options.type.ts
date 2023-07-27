export interface OpenTelemetryModuleOptions {
  /**
   * Enable the Open Telemetry instrumentation so that traces,
   * metrics, and logs are emitted. 
   */
  enableOpenTelemetry: boolean;

  /**
   * Disable the automatic discovery of providers and only 
   * capture telemetry from providers/functions decorated w/
   * `@OpenTelemetry` or `@OTelSpan`. 
   */
  disableAutoDiscovery?: boolean;
}
