import { registerEnumType } from '@nestjs/graphql';

export enum PermissionAction {
  LIST = 'List',
  GET = 'Get',
  CREATE = 'Create',
  UPDATE = 'Update',
  REMOVE = 'Remove',
}

registerEnumType(PermissionAction, {
  name: 'PermissionAction',
});
