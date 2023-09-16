import { ExecutionContext } from '@nestjs/common';
import { AuthType } from './auth-type.type';

export interface IamModuleOptions {
  /**
   * 
   */
  defaultAuthTypes?: AuthType[];

  /**
   * A function that checks if `AuthenticationGuard` should be exectued against
   * the current execution context.
   * @param {ExecutionContext} context
   * @returns {boolean}
   */
  useContext?: (context: ExecutionContext) => boolean;
}
