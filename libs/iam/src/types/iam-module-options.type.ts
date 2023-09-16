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

  /**
   * The name of the request header used for the Api Key. Defaults to `Api-Key`.
   */
  apiKeyHeader?: string;

  /**
   * The value of the Api Key. Defaults to `pass123`.
   */
  apiKey?: string;
}
