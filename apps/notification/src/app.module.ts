import * as Joi from '@hapi/joi';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { bullFactory } from './config/bull.config';
import { databaseFactory } from './config/database.config';
import { ConsumerModule } from './consumers/consumer.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validationSchema: Joi.object({
        API_KEY_HEADER: Joi.required(),
        API_KEY: Joi.required(),
        DB_HOST: Joi.required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.required(),
        DB_PASSWORD: Joi.required(),
        DB_NAME: Joi.required(),
        MAILER_HOST: Joi.required(),
        MAILER_PORT: Joi.number().required(),
        MAILER_USER: Joi.required(),
        MAILER_PASSWORD: Joi.required(),
        MAILER_SENDER: Joi.required(),
        REDIS_HOST: Joi.required(),
        REDIS_PORT: Joi.number().required(),
        ENABLE_REDIS_CLUSTER: Joi.boolean().default(false),
        BULLMQ_NOTIFICATION_QUEUE: Joi.required(),
        BULLMQ_NOTIFICATION_QUEUE_PREFIX: Joi.required(),
        BULLMQ_NOTIFICATION_JOB_AGE: Joi.number().required(),
        RETRY_ATTEMPTS: Joi.number().required(),
        RETRY_DELAY: Joi.number().required(),
        TWILIO_SID: Joi.required(),
        TWILIO_AUTH_TOKEN: Joi.required(),
        TWILIO_PHONE_NUMBER: Joi.required(),
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
    ConsumerModule,
    ResourcesModule,
  ],
  providers: [],
})
export class AppModule {}
