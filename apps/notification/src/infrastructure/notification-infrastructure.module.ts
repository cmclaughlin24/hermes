import { DynamicModule, Global, Module } from '@nestjs/common';
import { PostgresPersistanceModule } from './persistance/postgres/postgres-persistance.module';

export interface NotificationInfrastructureOptions {
  persistanceDriver: 'postgres' | string;
}

@Global()
@Module({})
export class NotificationInfrastructureModule {
  static use(_options: NotificationInfrastructureOptions): DynamicModule {
    // FIXME: Check persistance driver option and adjust module accordingly.
    const persistanceModule = PostgresPersistanceModule;

    return {
      module: NotificationInfrastructureModule,
      imports: [persistanceModule],
      exports: [persistanceModule],
    };
  }
}
