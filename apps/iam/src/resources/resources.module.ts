import { IamModule } from '@hermes/iam';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { CommonModule } from '../common/common.module';
import { VerifyTokenService } from '../common/services/verify-token.service';
import { iamFactory } from '../config/iam.config';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import { ApiKeyModule } from './api-key/api-key.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    IamModule.registerAsync({
      imports: [ConfigModule, CommonModule],
      inject: [ConfigService, VerifyTokenService],
      useFactory: iamFactory,
    }),
    UserModule,
    AuthenticationModule,
    PermissionModule,
    ApiKeyModule,
  ],
})
export class ResourcesModule {}
