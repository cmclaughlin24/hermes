import { SetMetadata } from '@nestjs/common';
import { IamPermissionOptions } from '../types/iam-permission-options.type';

export const PERMISSION_KEY = 'permission';

export const IamPermission = (options: IamPermissionOptions) =>
  SetMetadata(PERMISSION_KEY, options);
