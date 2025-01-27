import { ConfigurableModuleBuilder } from '@nestjs/common';

interface CoreModuleOptions {
  driver: 'postgres' | 'mariadb';
}

export const {
  ConfigurableModuleClass: CoreModuleDefinitionClass,
  OPTIONS_TYPE: CORE_MODULE_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN: CORE_MODULE_OPTIONS,
} = new ConfigurableModuleBuilder<CoreModuleOptions>()
  .setClassMethodName('forRoot')
  .build();
