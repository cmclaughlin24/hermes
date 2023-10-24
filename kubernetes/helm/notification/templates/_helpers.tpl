{{/*
Create the name of the ConfigMap to be used to configure the
OpenTelemetry Collector.
*/}}
{{- define "notification.otelConfigMapName" }}
  {{- print .Release.Name "-otel-config" }}
{{- end }}