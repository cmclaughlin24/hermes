import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import {
  IAM_MODULE_OPTIONS_TOKEN,
  IamModuleDefinitionClass,
} from './iam.module-definition';
import { TokenService } from './services/token.service';
import { IamModuleOptions } from './types/iam-module-options.type';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    ApiKeyGuard,
    {
      provide: TokenService,
      inject: [IAM_MODULE_OPTIONS_TOKEN],
      useFactory: (options: IamModuleOptions) => options.tokenService,
    },
  ],
})
export class IamModule extends IamModuleDefinitionClass {
  static register(options: IamModuleOptions = {}): DynamicModule {
    // Fixme: Add validation on options (e.g. TokenService must be present if enabled.)
    return super.register(options);
  }
}
