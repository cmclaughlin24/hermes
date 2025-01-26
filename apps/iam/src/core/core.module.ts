import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../resources/user/repository/entities/user.entity';
import { ApiKey } from '../resources/api-key/entities/api-key.entity';
import { Permission } from '../resources/permission/repository/entities/permission.entity';
import { DeliveryWindow } from '../resources/user/repository/entities/delivery-window.entity';
import {
  mariaDabaseFactory,
  postgresDatabaseFactory,
} from '../config/database.config';

export interface CoreModuleOptions {
  driver: 'postgres' | 'mariadb';
}

export const DATA_SOURCE = Symbol('DATA_SOURCE');

@Global()
@Module({})
export class CoreModule {
  static forRoot(options: CoreModuleOptions): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: DATA_SOURCE,
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            let dataSourceOptsFactory: (
              configService: ConfigService,
            ) => DataSourceOptions = postgresDatabaseFactory;

            if (options.driver === 'mariadb') {
              dataSourceOptsFactory = mariaDabaseFactory;
            }

            const dataSource = new DataSource({
              ...dataSourceOptsFactory(configService),
              // TODO: Investigate how to autoload entities (if possible) since webpack compiles to a
              // main.js file instead of *.entity.{ts|js}.
              entities: [ApiKey, DeliveryWindow, Permission, User],
            });

            return await dataSource.initialize();
          },
        },
      ],
      exports: [DATA_SOURCE],
    };
  }
}
