import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { IAM_MODULE_OPTIONS_TOKEN } from '../iam.module-definition';
import { IamModuleOptions } from '../types/iam-module-options.type';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private static readonly DEFAULT_API_KEY_HEADER = 'Api-Key';
  private static readonly DEFAULT_API_KEY = 'pass123';

  private get apiKeyHeader(): string {
    return this.options.apiKeyHeader ?? ApiKeyGuard.DEFAULT_API_KEY_HEADER;
  }

  private get apiKeys(): string[] {
    return this.options.apiKeys?.split(',') ?? [ApiKeyGuard.DEFAULT_API_KEY];
  }

  constructor(
    @Inject(IAM_MODULE_OPTIONS_TOKEN)
    private readonly options: IamModuleOptions,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return this.apiKeys.includes(request.header(this.apiKeyHeader));
  }
}
