import { OpenTelemetryModule } from '@hermes/open-telemetry';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { SequelizeModule } from '@nestjs/sequelize';
import * as Joi from 'joi';
import { join } from 'path';
import { CommonModule } from './common/common.module';
import { bullFactory } from './config/bull.config';
import { databaseFactory } from './config/database.config';
import { MqModule } from './mq/mq.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: join(process.cwd(), 'env', 'distribution.env'),
      isGlobal: true,
      validationSchema: Joi.object({
        API_KEY_HEADER: Joi.required(),
        ENABLE_DEVTOOLS: Joi.boolean().default(false),
        DEVTOOLS_PORT: Joi.number().default(8001),
        DB_HOST: Joi.required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.required(),
        DB_PASSWORD: Joi.required(),
        DB_NAME: Joi.required(),
        DB_SYNC: Joi.boolean().default(false),
        ENABLE_OPEN_TELEMETRY: Joi.boolean().default(false),
        RABBITMQ_URI: Joi.required(),
        RABBITMQ_DISTRIBUTION_EXCHANGE: Joi.required(),
        RABBITMQ_DISTRIBUTION_QUEUE: Joi.required(),
        REDIS_HOST: Joi.required(),
        REDIS_PORT: Joi.number().required(),
        ENABLE_REDIS_CLUSTER: Joi.boolean().default(false),
        BULLMQ_NOTIFICATION_QUEUE: Joi.required(),
        BULLMQ_NOTIFICATION_QUEUE_PREFIX: Joi.required(),
        RETRY_ATTEMPTS: Joi.number().required(),
        RETRY_DELAY: Joi.number().required(),
        SUBSCRIBERS_REQUEST_URL: Joi.string().required(),
        IAM_CLIENT_URL: Joi.string().required(),
      }),
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseFactory,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: bullFactory,
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
    CommonModule,
    MqModule,
  ],
})
export class AppModule {}
