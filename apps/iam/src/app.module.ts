import { OpenTelemetryModule } from '@hermes/open-telemetry';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: `${process.cwd()}/env/iam.env`,
      validationSchema: Joi.object({
        ENABLE_DEVTOOLS: Joi.boolean().default(false),
        DEVTOOLS_PORT: Joi.number().default(8002),
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
  ],
})
export class AppModule {}
