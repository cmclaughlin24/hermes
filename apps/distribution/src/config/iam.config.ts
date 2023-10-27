import { IamAccessTokenService } from '@hermes/common';
import { AuthType, IamModuleOptions } from '@hermes/iam';
import { ConfigService } from '@nestjs/config';

export function iamFactory(
  configService: ConfigService,
  iamAccessTokenService: IamAccessTokenService,
): IamModuleOptions {
  return {
    defaultAuthTypes: [AuthType.BEARER, AuthType.API_KEY],
    apiKeyHeader: configService.get('API_KEY_HEADER'),
    apiKeys: configService.get('API_KEY'),
    accessTokenService: iamAccessTokenService,
  };
}
