curl 'IAM_URL' \
  -H 'Accept-Encoding: gzip, deflate, br' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer SYSADMIN_ACCESS_TOKEN' \
  --data-binary '{"query":"mutation {\n  createApiKey(\n    createApiKeyInput: {\n      name: \"distribution_api_key\"\n      permissions: [{ resource: \"user\", action: \"list\" }]\n    }\n  )\n}\n"}' \
  --compressed