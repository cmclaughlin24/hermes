import { IamClientModule, IamClientService, RequestLoggerMiddleware } from '@hermes/common';
import { IamModule } from '@hermes/iam';
import { DynamicModule, Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  mariaDabaseFactory,
  postgresDatabaseFactory,
} from '../config/database.config';
import { iamFactory } from '../config/iam.config';

export interface CoreModuleOptions {
  driver: 'postgres' | 'mariadb';
}

@Global()
@Module({})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }

  static forRoot(options: CoreModuleOptions): DynamicModule {
    const persistanceFactory = CoreModule.getDatabaseFactory(options.driver);

    return {
      module: CoreModule,
      imports: [
        IamModule.registerAsync({
          imports: [ConfigModule, IamClientModule],
          inject: [ConfigService, IamClientService],
          useFactory: iamFactory,
        }),
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
