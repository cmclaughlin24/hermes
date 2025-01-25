import { OpenTelemetryModule } from '@hermes/open-telemetry';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import * as Joi from 'joi';
import { join } from 'path';
import { ResourcesModule } from './resources/resources.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: join(process.cwd(), 'env', 'iam.env'),
      isGlobal: true,
      validationSchema: Joi.object({
        API_KEY_HEADER: Joi.required(),
        ENABLE_DEVTOOLS: Joi.boolean().default(false),
        DEVTOOLS_PORT: Joi.number().default(8002),
        DB_HOST: Joi.required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.required(),
        DB_PASSWORD: Joi.required(),
        DB_NAME: Joi.required(),
        DB_SYNC: Joi.boolean().default(false),
        DB_SSL: Joi.boolean().default(false),
        JWT_SECRET: Joi.required(),
        JWT_TOKEN_AUDIENCE: Joi.required(),
        JWT_TOKEN_ISSUER: Joi.required(),
        JWT_ACCESS_TOKEN_TTL: Joi.number().default(3600),
        JWT_REFRESH_TOKEN_TTL: Joi.number().default(86400),
        REDIS_HOST: Joi.required(),
        REDIS_PORT: Joi.number().required(),
        ENABLE_REDIS_CLUSTER: Joi.boolean().default(false),
        ENABLE_OPEN_TELEMETRY: Joi.boolean().default(false),
      }),
    }),
    OpenTelemetryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        enableOpenTelemetry: configService.get('ENABLE_OPEN_TELEMETRY'),
      }),
    }),
    DevtoolsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        http: configService.get('ENABLE_DEVTOOLS'),
        port: configService.get('DEVTOOLS_PORT'),
      }),
    }),
    ResourcesModule,
    CoreModule.forRoot({ driver: 'postgres' }),
  ],
})
export class AppModule {}
