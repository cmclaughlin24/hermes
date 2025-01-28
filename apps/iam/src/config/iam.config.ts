import { AuthType, IamModuleOptions } from '@hermes/iam';
import { ConfigService } from '@nestjs/config';
import { TenantTokenService } from '../core/services/tenant-token.service';

export function iamFactory(
  configService: ConfigService,
  tenantTokenService: TenantTokenService,
): IamModuleOptions {
  return {
    defaultAuthTypes: [AuthType.API_KEY, AuthType.BEARER],
    apiKeyHeader: configService.get('API_KEY_HEADER'),
    tokenService: tenantTokenService,
  };
}
