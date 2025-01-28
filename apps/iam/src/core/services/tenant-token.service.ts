import { ActiveEntityData, TokenService } from '@hermes/iam';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AggregateByTenantStrategy } from '../strategies/aggregate-by-tenant.strategy';
import { TENANCY_KEY } from '../middlewares/tenancy.middleware';
import { AuthenticationService } from '../../resources/authentication/authentication.service';
import { ApiKeyService } from '../../resources/api-key/api-key.service';

@Injectable()
export class TenantTokenService implements TokenService {
  constructor(private readonly moduleRef: ModuleRef) {}

  async verifyAccessToken(token: string, req?: any): Promise<ActiveEntityData> {
    const tenantSubTreeId = AggregateByTenantStrategy.get(req[TENANCY_KEY]);
    let authenicationService: AuthenticationService =
      await this.moduleRef.resolve(AuthenticationService, tenantSubTreeId, {
        strict: false, // NOTE: TenantTokenService needs to be able to search outside of it's module scope.
      });

    return authenicationService.verifyToken(token);
  }

  async verifyApiKey(apiKey: string, req?: any): Promise<ActiveEntityData> {
    const tenantSubTreeId = AggregateByTenantStrategy.get(req[TENANCY_KEY]);
    const apiKeyService = await this.moduleRef.resolve(
      ApiKeyService,
      tenantSubTreeId,
      { strict: false }, // NOTE: TenantTokenService needs to be able to search outside of it's module scope.
    );

    return apiKeyService.verifyApiKey(apiKey);
  }
}
