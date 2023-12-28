# Script creates the api key required by the Notification Service to remove expired push subscriptions.
curl 'IAM_URL' \
  -H 'Accept-Encoding: gzip, deflate, br' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer SYSADMIN_ACCESS_TOKEN' \
  --data-binary '{"query":"mutation {\n  createApiKey(\n    createApiKeyInput: {\n      name: \"notification_api_key\"\n      permissions: [{ resource: \"subscription\", action: \"remove\" }]\n    }\n  )\n}\n"}' \
  --compressed