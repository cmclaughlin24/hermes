{{/*
Create the Selector (label query) to filter on when initializing the
Redis Cluster.
*/}}
{{- define "redis-cluster.labelsAsString" -}}
{{- $output := "" }}
{{- range $key,$value := .Values.selectorLabels }}
  {{- if $output }}
    {{- $output = print $output $key "=" $value "," }}
  {{- else }}
    {{- $output = print $key "=" $value "," }}
  {{- end }}
{{- end }}
{{- printf $output | trimSuffix "," }}
{{- end }}