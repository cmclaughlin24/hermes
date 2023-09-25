import { OpenTelemetryModule } from '@hermes/open-telemetry';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { join } from 'path';
import { databaseFactory } from './config/database.config';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: join(process.cwd(), 'env', 'iam.env'),
      validationSchema: Joi.object({
        ENABLE_DEVTOOLS: Joi.boolean().default(false),
        DEVTOOLS_PORT: Joi.number().default(8002),
        DB_HOST: Joi.required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.required(),
        DB_PASSWORD: Joi.required(),
        DB_NAME: Joi.required(),
        ENABLE_OPEN_TELEMETRY: Joi.boolean().default(false),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseFactory,
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
  ],
})
export class AppModule {}
