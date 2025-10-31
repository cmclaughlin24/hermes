import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { TwilioModule } from 'nestjs-twilio';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotifierStrategyService } from './notifier-strategy.service';
import { EmailStrategy } from './strategies/email.strategy';
import { CallStrategy } from './strategies/call.strategy';
import { SmsStrategy } from './strategies/sms.strategy';
import { PushNotificationStrategy } from './strategies/push-notification.strategy';
import { EmailTemplateModule } from '../email-template/email-template.module';
import { PhoneTemplateModule } from '../phone-template/phone-template.module';
import { PushTemplateModule } from '../push-template/push-template.module';
import { NotificationConsumer } from './notification.consumer';
import { NotificationLogModule } from '../notification-log/notification-log.module';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      // NOTE: BullModule throws an error when using the ConfigModule to retrieve
      //       the notification queue name from the environment.
      name: process.env.BULLMQ_NOTIFICATION_QUEUE,
      // NOTE: Bullmq requires the prefix option as a cluster "hash tag". See
      //       https://docs.bullmq.io/bull/patterns/redis-cluster for more information.
      prefix: process.env.BULLMQ_NOTIFICATION_QUEUE_PREFIX,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('MAILER_HOST'),
            port: configService.get('MAILER_PORT'),
            auth: {
              user: configService.get('MAILER_USER'),
              pass: configService.get('MAILER_PASSWORD'),
            },
          },
        };
      },
    }),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        accountSid: configService.get('TWILIO_SID'),
        authToken: configService.get('TWILIO_AUTH_TOKEN'),
      }),
    }),
    EmailTemplateModule,
    PhoneTemplateModule,
    PushTemplateModule,
    NotificationLogModule,
  ],
  providers: [
    NotificationConsumer,
    NotificationService,
    NotifierStrategyService,
    EmailStrategy,
    CallStrategy,
    SmsStrategy,
    PushNotificationStrategy,
  ],
  controllers: [NotificationController],
})
export class NotificationModule {}
