import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { OpenTelemetryModule } from '@hermes/open-telemetry';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { SequelizeModule } from '@nestjs/sequelize';
import * as Joi from 'joi';
import { join } from 'path';
import './common/helpers/handlebar.helpers';
import { bullFactory } from './config/bull.config';
import { databaseFactory } from './config/database.config';
import { ConsumerModule } from './consumers/consumer.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: join(process.cwd(), 'env', 'notification.env'),
      isGlobal: true,
      validationSchema: Joi.object({
        API_KEY_HEADER: Joi.required(),
        API_KEY: Joi.required(),
        DB_HOST: Joi.required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.required(),
        DB_PASSWORD: Joi.required(),
        DB_NAME: Joi.required(),
        ENABLE_DEVTOOLS: Joi.boolean().default(false),
        ENABLE_OPEN_TELEMETRY: Joi.boolean().default(false),
        DEVTOOLS_PORT: Joi.number().default(8000),
        MAILER_HOST: Joi.required(),
        MAILER_PORT: Joi.number().required(),
        MAILER_USER: Joi.required(),
        MAILER_PASSWORD: Joi.required(),
        MAILER_SENDER: Joi.required(),
        REDIS_HOST: Joi.required(),
        REDIS_PORT: Joi.number().required(),
        CACHE_COMMAND_TIMEOUT: Joi.number().default(100),
        ENABLE_REDIS_CLUSTER: Joi.boolean().default(false),
        BULLMQ_NOTIFICATION_QUEUE: Joi.required(),
        BULLMQ_NOTIFICATION_QUEUE_PREFIX: Joi.required(),
        BULLMQ_NOTIFICATION_JOB_AGE: Joi.number().required(),
        BULLMQ_CONCURRENCY: Joi.number().min(1).required(),
        RETRY_ATTEMPTS: Joi.number().required(),
        RETRY_DELAY: Joi.number().required(),
        TWILIO_SID: Joi.required(),
        TWILIO_AUTH_TOKEN: Joi.required(),
        TWILIO_PHONE_NUMBER: Joi.required(),
        REMOVE_SUBSCRIBER_URL: Joi.string().required(),
        SUBSCRIBER_API_KEY_HEADER: Joi.string().required(),
        SUBSCRIBER_API_KEY: Joi.string().required(),
        VAPID_SUBJECT: Joi.required(),
        VAPID_PUBLIC_KEY: Joi.required(),
        VAPID_PRIVATE_KEY: Joi.required(),
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
    BullBoardModule.forRoot({
      route: '/queues/admin',
      adapter: ExpressAdapter as any,
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
    ConsumerModule,
    ResourcesModule,
  ],
  providers: [],
})
export class AppModule {}
