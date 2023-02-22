import { BullModule } from '@nestjs/bull';
import { DynamicModule, Module } from '@nestjs/common';
import { createDefaultEventHandlerController } from './default-event-handler/default-event-handler.controller';

export interface EventHandlersModuleOptions {
  events: { name: string; controller?: string }[];
}

@Module({})
export class EventHandlersModule {
  static forRoot(options: EventHandlersModuleOptions): DynamicModule {
    // Note: Dynamically create EventHandlerControllers to listen for different events. Allows
    //       for new channels to use default notification rules or custom rules.
    const controllers = [];

    for (const event of options.events) {
      let controller;

      switch (event.controller) {
        default:
          controller = createDefaultEventHandlerController(event.name);
      }

      controllers.push(controller);
    }

    return {
      module: EventHandlersModule,
      imports: [
        BullModule.registerQueue({
          name: 'notification',
        }),
      ],
      controllers: controllers,
    };
  }
}
