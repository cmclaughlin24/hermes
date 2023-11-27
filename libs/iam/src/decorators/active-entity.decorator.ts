import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { IAM_ENTITY_KEY } from '../constants/iam.constants';
import { ActiveEntityData } from '../types/active-entity-data.type';
import { getRequest } from '../utils/iam.utils';

/**
 * Extracts the `entity` property from the `req` object and populates the decorated
 * parameter with the value of `entity` or a single specified argument.
 * 
 * Example (no extraction):
 * ```typescript
 * create(@ActiveEntity() entity: ActiveEntityData)
 * ```
 * 
 * Example (w/extraction):
 * ```typescript
 * create(@ActiveEntity('sub') entityId: string)
 * ```
 */
export const ActiveEntity = createParamDecorator(
  (field: keyof ActiveEntityData | undefined, context: ExecutionContext) => {
    const entity = getRequest(context)[IAM_ENTITY_KEY];
    return field ? entity?.[field] : entity;
  },
);
