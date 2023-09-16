import { SetMetadata } from '@nestjs/common';
import { AuthType } from '../types/auth-type.type';

export const AUTH_TYPE_KEY = 'authType';

export const Auth = (...args: AuthType[]) => SetMetadata(AUTH_TYPE_KEY, args);
