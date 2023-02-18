import * as Joi from '@hapi/joi';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConsumerModule } from './consumers/consumer.module';
import { NotificationJobModule } from './resources/notification-job/notification-job.module';
import { NotificationLogModule } from './resources/notification-log/notification-log.module';
import { NotificationModule } from './resources/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validationSchema: Joi.object({
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
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadModels: true,
        synchronize: true,
        logging: false
      })
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
        defaultJobOptions: {
          attempts: configService.get('RETRY_ATTEMPTS'),
          backoff: {
            type: 'exponential',
            delay: configService.get('RETRY_DELAY'),
          }
        },
      }),
    }),
    ConsumerModule,
    NotificationModule,
    NotificationJobModule,
    NotificationLogModule,
  ],
  providers: [],
})
export class AppModule {}
