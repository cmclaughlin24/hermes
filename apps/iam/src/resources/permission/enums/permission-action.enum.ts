import { registerEnumType } from '@nestjs/graphql';

export enum PermissionAction {
  LIST = 'list',
  GET = 'get',
  CREATE = 'create',
  UPDATE = 'update',
  REMOVE = 'remove',
}

registerEnumType(PermissionAction, {
  name: 'PermissionAction',
});
