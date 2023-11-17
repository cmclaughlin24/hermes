import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as _ from 'lodash';
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator';
import { IAM_MODULE_OPTIONS_TOKEN } from '../iam.module-definition';
import { AuthType } from '../types/auth-type.type';
import { IamModuleOptions } from '../types/iam-module-options.type';
import { AccessTokenGuard } from './access-token.guard';
import { ApiKeyGuard } from './api-key.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private get defaultAuthTypes(): AuthType[] {
    return this.options.defaultAuthTypes || [AuthType.API_KEY];
  }

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.NONE]: { canActivate: () => true },
    [AuthType.API_KEY]: this.apiKeyGuard,
    [AuthType.BEARER]: this.accessTokenGuard,
  };

  constructor(
    @Inject(IAM_MODULE_OPTIONS_TOKEN)
    private readonly options: IamModuleOptions,
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.options.useContext && !this.options.useContext(context)) {
      return true;
    }

    const authTypes =
      this.reflector.getAllAndOverride(AUTH_TYPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? this.defaultAuthTypes;
    const guards = this._getAuthGuards(authTypes);
    let error = new UnauthorizedException();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err) => {
        error = err;
      });

      if (canActivate) {
        return true;
      }
    }

    throw error;
  }

  private _getAuthGuards(authTypes: AuthType[]) {
    return authTypes
      .filter((type) => this._isAuthEnabled(type))
      .map((type) => this.authTypeGuardMap[type])
      .flat();
  }

  private _isAuthEnabled(authType: AuthType): boolean {
    if (_.isEmpty(this.options.enableAuthTypes)) {
      return true;
    }
    return this.options.enableAuthTypes.includes(authType);
  }
}
