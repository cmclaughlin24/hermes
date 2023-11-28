import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IAM_ENTITY_KEY } from '../constants/iam.constants';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { ActiveEntityData } from '../types/active-entity-data.type';
import { IamPermissionOptions } from '../types/iam-permission-options.type';
import { getRequest, unpackPermissions } from '../utils/iam.utils';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
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
