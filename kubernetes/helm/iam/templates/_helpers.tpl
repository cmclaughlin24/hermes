{{/*
Create the name of the ConfigMap to be used to configure the
OpenTelemetry Collector.
*/}}
{{- define "iam.otelConfigMapName" }}
  {{- print .Release.Name "-otel-config" }}
{{- end }}