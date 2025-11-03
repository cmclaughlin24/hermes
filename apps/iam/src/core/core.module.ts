import { IamModule } from '@hermes/iam';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyModule } from '../api-key/api-key.module';
import { ApiKeyService } from '../api-key/api-key.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
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
export class CoreModule {
  static forRoot(options: CoreModuleOptions): DynamicModule {
    const persistanceFactory = CoreModule.getDatabaseFactory(options.driver);

    return {
      module: CoreModule,
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
        IamModule.registerAsync({
          imports: [ConfigModule, AuthenticationModule, ApiKeyModule],
          inject: [ConfigService, AuthenticationService, ApiKeyService],
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
