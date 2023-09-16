import { ConfigurableModuleBuilder } from '@nestjs/common';
import { IamModuleOptions } from './types/iam-module-options.type';

export const {
  ConfigurableModuleClass: IamModuleDefinitionClass,
  MODULE_OPTIONS_TOKEN: IAM_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<IamModuleOptions>().build();
