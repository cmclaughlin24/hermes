import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';
import { EmailService } from './providers/email/email.service';
import { PhoneService } from './providers/phone/phone.service';
import { RadioService } from './providers/radio/radio.service';

@Module({
  imports: [
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
          template: {
            dir: __dirname + '/templates/',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
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
  ],
  providers: [EmailService, PhoneService, RadioService],
  exports: [EmailService, PhoneService, RadioService],
})
export class CommonModule {}
