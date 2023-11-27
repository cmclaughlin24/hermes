import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { IAM_ENTITY_KEY } from '../constants/iam.constants';
import { ActiveEntityData } from '../types/active-entity-data.type';
import { getRequest, unpackPermissions } from '../utils/iam.utils';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Fixme: Use correct metadata key and type support.
    const contextPermissions = this.reflector.getAllAndOverride<any[]>('', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Note: Authorization is assumed to be disabled if a permission is not specified for a resource.
    if (_.isEmpty(contextPermissions)) {
      return true;
    }

    const entity: ActiveEntityData = getRequest(context)[IAM_ENTITY_KEY];
    const entityPermissions = unpackPermissions<string>(
      entity?.authorization_details,
    );

    return true;
  }
}
