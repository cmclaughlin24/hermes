import { AuthType, IamModuleOptions } from '@hermes/iam';
import { ConfigService } from '@nestjs/config';
import { ApiKeyService } from '../resources/api-key/api-key.service';
import { AuthenticationService } from '../resources/authentication/authentication.service';

export function iamFactory(
  configService: ConfigService,
  authenticationService: AuthenticationService,
  apiKeyService: ApiKeyService,
): IamModuleOptions {
  return {
    defaultAuthTypes: [AuthType.API_KEY, AuthType.BEARER],
    apiKeyHeader: configService.get('API_KEY_HEADER'),
    tokenService: {
      verifyAccessToken: authenticationService.verifyToken.bind(
        authenticationService,
      ),
      verifyApiKey: apiKeyService.verifyApiKey.bind(apiKeyService),
    },
  };
}
