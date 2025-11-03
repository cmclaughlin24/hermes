import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  mariaDabaseFactory,
  postgresDatabaseFactory,
} from '../config/database.config';

export interface CoreModuleOptions {
  driver: 'postgres' | 'mariadb';
}

@Module({})
export class CoreModule {
  static forRoot(options: CoreModuleOptions): DynamicModule {
    const persistanceFactory = CoreModule.getDatabaseFactory(options.driver);

    return {
      module: CoreModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: persistanceFactory,
        }),
      ],
    };
  }

  static getDatabaseFactory(driver: 'postgres' | 'mariadb') {
    switch (driver) {
      case 'mariadb':
        return mariaDabaseFactory;
      case 'postgres':
        return postgresDatabaseFactory;
      default:
        throw new Error(
          `Unknown database driver ${driver}; expected postgres or mariadb`,
        );
    }
  }
}
