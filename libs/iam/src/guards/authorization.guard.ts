import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IAM_MODULE_OPTIONS_TOKEN } from '../iam.module-definition';
import { IamModuleOptions } from '../types/iam-module-options.type';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    @Inject(IAM_MODULE_OPTIONS_TOKEN)
    private readonly options: IamModuleOptions,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
