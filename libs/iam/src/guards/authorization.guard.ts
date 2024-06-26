import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IAM_ENTITY_KEY } from '../constants/iam.constants';
import { PERMISSION_KEY } from '../decorators/iam-permission.decorator';
import { IAM_MODULE_OPTIONS_TOKEN } from '../iam.module-definition';
import { ActiveEntityData } from '../types/active-entity-data.type';
import { IamModuleOptions } from '../types/iam-module-options.type';
import { IamPermissionOptions } from '../types/iam-permission-options.type';
import { getRequest, unpackPermissions } from '../utils/iam.utils';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    @Inject(IAM_MODULE_OPTIONS_TOKEN)
    private readonly options: IamModuleOptions,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    if (this.options.useContext && !this.options.useContext(context)) {
      return true;
    }

    const permission = this.reflector.getAllAndOverride<IamPermissionOptions>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Note: Authorization is assumed to be disabled if a permission is not specified for a resource.
    if (!permission) {
      return true;
    }

    const entity: ActiveEntityData = getRequest(context)[IAM_ENTITY_KEY];

    return this._hasPermission(permission.resource, permission.action, entity);
  }

  /**
   * Yields true if the entity is authorized to complete the requested action for a
   * resource or false otherwise.
   * @param {string} resource
   * @param {string} action
   * @param {ActiveEntityData} entity
   * @returns {boolean}
   */
  private _hasPermission(
    resource: string,
    action: string,
    entity: ActiveEntityData,
  ) {
    const entityPermissions = unpackPermissions<string>(
      entity?.authorization_details,
    );
    return entityPermissions.get(resource)?.includes(action);
  }
}
