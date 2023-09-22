import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { dockerCGroupV1Detector } from '@opentelemetry/resource-detector-docker';
import { envDetector, processDetector } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
  resourceDetectors: [envDetector, processDetector, dockerCGroupV1Detector],
});

sdk.start();

// Note: Gracefully shutdown the SDK on process exit.
process.on('SIGINT', () => {
  sdk
    .shutdown()
    .catch(console.error)
    .finally(() => process.exit(0));
});
