import { IamModule } from '@hermes/iam';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { iamMultiTenantFactory } from '../config/iam.config';
import { ApiKeyModule } from './api-key/api-key.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { PermissionModule } from './permission/permission.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { TenancyMiddleware } from '../core/middlewares/tenancy.middleware';
import { TenantTokenService } from '../core/services/tenant-token.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    IamModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService, TenantTokenService],
      useFactory: iamMultiTenantFactory,
    }),
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
