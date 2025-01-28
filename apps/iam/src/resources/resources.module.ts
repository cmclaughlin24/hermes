import { IamModule } from '@hermes/iam';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { iamFactory } from '../config/iam.config';
import { ApiKeyModule } from './api-key/api-key.module';
import { ApiKeyService } from './api-key/api-key.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationService } from './authentication/authentication.service';
import { PermissionModule } from './permission/permission.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { TenancyMiddleware } from '../core/middlewares/tenancy.middleware';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    // FIXME: Re-enable authentication once determined how to handle durable providers.
    //IamModule.registerAsync({
    //  imports: [ConfigModule, AuthenticationModule, ApiKeyModule],
    //  inject: [ConfigService, AuthenticationService, ApiKeyService],
    //  useFactory: iamFactory,
    //}),
    AuthenticationModule,
    ApiKeyModule,
    PermissionModule,
    UserModule,
    HealthModule,
  ],
})
export class ResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenancyMiddleware).forRoutes('*');
  }
}
