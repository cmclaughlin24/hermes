import * as Joi from '@hapi/joi';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from './common/common.module';
import { bullFactory } from './config/bull.config';
import { databaseFactory } from './config/database.config';
import { MqModule } from './mq/mq.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validationSchema: Joi.object({
        API_KEY: Joi.required(),
        DB_HOST: Joi.required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.required(),
        DB_PASSWORD: Joi.required(),
        DB_NAME: Joi.required(),
        RABBITMQ_URI: Joi.required(),
        RABBITMQ_DISTRIBUTION_EXCHANGE: Joi.required(),
        RABBITMQ_DISTRIBUTION_QUEUE: Joi.required(),
        REDIS_HOST: Joi.required(),
        REDIS_PORT: Joi.number().required(),
        BULLMQ_NOTIFICATION_QUEUE: Joi.required(),
        BULLMQ_NOTIFICATION_QUEUE_PREFIX: Joi.required(),
        RETRY_ATTEMPTS: Joi.number().required(),
        RETRY_DELAY: Joi.number().required(),
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
    ResourcesModule,
    CommonModule,
    MqModule,
  ],
})
export class AppModule {}
