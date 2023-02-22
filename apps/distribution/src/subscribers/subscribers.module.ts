import { DynamicModule, Module } from '@nestjs/common';
import { createDefaultSubscriberController } from './default-subscriber/default-subscriber.controller';

export interface SubscribersModuleOptions {}

@Module({})
export class SubscribersModule {
  static async forRootAsync(
    options?: SubscribersModuleOptions,
  ): Promise<DynamicModule> {
    const controllers = [
      createDefaultSubscriberController('gandalf'),
      createDefaultSubscriberController('aragorn'),
    ];

    // Fixme: Load controller names and class from database and push to controllers array.

    return {
      module: SubscribersModule,
      controllers: controllers,
    };
  }
}
