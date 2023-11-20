import { IamModule } from '@hermes/iam';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { iamFactory } from '../config/iam.config';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    IamModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: iamFactory,
    }),
    UserModule,
    AuthenticationModule,
  ],
})
export class ResourcesModule {}
