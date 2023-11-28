import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import * as _ from 'lodash';

/**
 * Yields the `Request` object from the current execution process.
 * @param {ExecutionContext} context
 * @returns {Request}
 */
export function getRequest(context: ExecutionContext): Request {
  if (context.getType<GqlContextType>() === 'graphql') {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.req;
  }

  return context.switchToHttp().getRequest<Request>();
}

/**
 * Yields a list of stringified permissions where each permission is represented by comma
 * seperated actions appended to the resource.
 * @example
 * - "VideoGameCharacters=List"
 * - "VideoGameCharacters=List,Get,Create"
 * @param {{ resource: string; action: T }[]} permissions
 * @returns {string[]}
 */
export function packPermissions<T>(
  permissions: { resource: string; action: T }[],
) {
  if (_.isEmpty(permissions)) {
    return [];
  }

  const map = new Map<string, T[]>();

  for (const permission of permissions) {
    const actions = map.has(permission.resource)
      ? map.get(permission.resource)
      : [];

    actions.push(permission.action);
    map.set(permission.resource, actions);
  }

  return _.chain(map)
    .toPairs()
    .map(([resource, actions]) => `${resource}=${actions.join(',')}`)
    .value();
}

/**
 * Yields a permissions map where the key is the resource and the value is a
 * list of allowed actions for that resource.
 * @example
 * - "VideoGameCharacters=List,Get,Create" => "VideoGameCharacters ['List', 'Get', 'Create']"
 * @param {string[]} permissions
 * @returns {Map<string, T[]>}
 */
export function unpackPermissions<T>(permissions: string[]) {
  const map = new Map<string, T[]>();

  if (_.isEmpty(permissions)) {
    return map;
  }

  for (const permission of permissions) {
    const [resource, actions] = permission.split('=');
    map.set(resource, actions.split(',') as T[]);
  }

  return map;
}
