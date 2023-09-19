import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { IamModuleDefinitionClass } from './iam.module-definition';
import { IamModuleOptions } from './types/iam-module-options.type';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    ApiKeyGuard,
  ],
  exports: [],
})
export class IamModule extends IamModuleDefinitionClass {
  static register(options: IamModuleOptions = {}): DynamicModule {
    return super.register(options);
  }
}
