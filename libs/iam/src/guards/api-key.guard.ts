import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IAM_ENTITY_KEY } from '../constants/iam.constants';
import { IAM_MODULE_OPTIONS_TOKEN } from '../iam.module-definition';
import { TokenService } from '../services/token.service';
import { IamModuleOptions } from '../types/iam-module-options.type';
import { getRequest } from '../utils/iam.utils';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private static readonly DEFAULT_API_KEY_HEADER = 'Api-Key';

  private get apiKeyHeader(): string {
    return this.options.apiKeyHeader ?? ApiKeyGuard.DEFAULT_API_KEY_HEADER;
  }

  constructor(
    @Inject(IAM_MODULE_OPTIONS_TOKEN)
    private readonly options: IamModuleOptions,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getRequest(context);
    const apiKey = request.header(this.apiKeyHeader);

    if (!apiKey) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.tokenService.verifyApiKey(apiKey);

      request[IAM_ENTITY_KEY] = payload;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
