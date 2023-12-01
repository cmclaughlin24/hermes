import { AuthType, IamModuleOptions } from '@hermes/iam';
import { ConfigService } from '@nestjs/config';
import { VerifyTokenService } from '../common/services/verify-token.service';

export function iamFactory(
  configService: ConfigService,
  verifyTokenService: VerifyTokenService,
): IamModuleOptions {
  return {
    defaultAuthTypes: [AuthType.API_KEY, AuthType.BEARER],
    apiKeyHeader: configService.get('API_KEY_HEADER'),
    tokenService: verifyTokenService,
  };
}
