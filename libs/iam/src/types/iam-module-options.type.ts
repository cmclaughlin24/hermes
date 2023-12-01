import { ExecutionContext } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { AuthType } from './auth-type.type';

export interface IamModuleOptions {
  /**
   * Optional parameter for specifying the default authentication types.
   */
  defaultAuthTypes?: AuthType[];

  /**
   * Optional parameter for specifying the enabled authentication types. If not provided,
   * the default is all.
   */
  enableAuthTypes?: AuthType[];

  /**
   * Optional parameter for specifying to check the requesting entity's allowed actions
   * for that resource. If not provided, the default is `true`.
   */
  disableAuthorization?: boolean;

  /**
   * Optional parameter for a function that checks if `AuthenticationGuard` should be
   * exectued against the current execution context.
   * @param {ExecutionContext} context
   * @returns {boolean}
   */
  useContext?: (context: ExecutionContext) => boolean;

  /**
   * Optional parameter for specifying the name of the request header used for
   * the Api Key. If not provided, defaults to `Api-Key`.
   */
  apiKeyHeader?: string;

  /**
   * Optional parameter represents an instance of a service that extends the `TokenService`
   * abstract class. It is used to validate and decode access tokens and api keys to ensure
   * the authenticity of the requesting entity.
   *
   * Note: This paremeter is required if the `AuthType.BEARER` or `AuthType.API_KEY` is enabled.
   */
  tokenService?: TokenService;
}
