import { DynamicModule, Module } from '@nestjs/common';
import { createDefaultEventHandlerController } from './default-event-handler/default-event-handler.controller';

export interface EventHandlersModuleOptions {}

@Module({})
export class EventHandlersModule {
  static async forRootAsync(
    options?: EventHandlersModuleOptions,
  ): Promise<DynamicModule> {
    const controllers = [
      createDefaultEventHandlerController('gandalf'),
      createDefaultEventHandlerController('aragorn'),
    ];

    // Fixme: Load controller names and class from database and push to controllers array.

    return {
      module: EventHandlersModule,
      controllers: controllers,
    };
  }
}
