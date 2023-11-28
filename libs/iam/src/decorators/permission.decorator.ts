import { SetMetadata } from '@nestjs/common';
import { IamPermissionOptions } from '../types/iam-permission-options.type';

export const PERMISSION_KEY = 'permission';

export const Permission = (options: IamPermissionOptions) =>
  SetMetadata(PERMISSION_KEY, options);
