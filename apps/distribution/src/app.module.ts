import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import * as Joi from '@hapi/joi';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from './common/common.module';
import { bullFactory } from './config/bull.config';
import { databaseFactory } from './config/database.config';
import { rabbitmqFactory } from './config/rabbitmq.config';
import { ConsumersModule } from './consumers/consumers.module';
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
        REDIS_HOST: Joi.required(),
        REDIS_PORT: Joi.number().required(),
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
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: rabbitmqFactory,
    }),
    ResourcesModule,
    CommonModule,
    ConsumersModule,
  ],
})
export class AppModule {}
