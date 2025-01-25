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
    let persistanceModule = TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: postgresDatabaseFactory,
    });

    if (options.driver === 'mariadb') {
      persistanceModule = TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: mariaDabaseFactory,
      });
    }

    return {
      module: CoreModule,
      imports: [persistanceModule],
    };
  }
}
