import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsTimeZone,
} from 'class-validator';
import { EmailTemplateExists } from '../decorators/email-template-exists.decorator';

export class CreateEmailNotificationDto {
  @ApiProperty({
    description: 'Recipient of the email',
    example: 'example@email.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: "Verified email sender (defaults to environment's sender)",
    example: 'example@email.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  from?: string;

  @ApiProperty({
    description:
      'Time zone to use when formatting dates/times (overridden if "context" property has a "timeZone" property)',
    example: 'America/Chicago',
    required: false,
  })
  @IsTimeZone()
  @IsOptional()
  timeZone?: string;

  @ApiProperty({
    description:
      'Subject template that can accept values from a nested JavaScript object',
    example: "{{firstName}}'s first notification!",
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  subject?: string;

  @ApiProperty({
    description:
      'Plain text email body that can accept values from a JavaScript object. Uses Handlebars ' +
      'to compile template and support date formating through the "formatDate" helper.',
    example:
      "You successfully sent you're first {{notificationType}} notification!",
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  text: string;

  @ApiProperty({
    description:
      'Handlebars HTML template for the email body (overridden if "template" property is provided). ' +
      'Date formatting supported through the "formatDate" Handlerbars helper.',
    example: '<body><main><h1>{{title}}</h1></main></body>',
    externalDocs: {
      url: 'https://handlebarsjs.com/',
      description: 'Handlebars',
    },
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  html?: string;

  @ApiProperty({
    description:
      'Name of an email template (overrides "html" property if provided)',
    example: 'template',
    required: false,
  })
  @IsString()
  @IsOptional()
  @EmailTemplateExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  template?: string;

  @ApiProperty({
    description: 'Values to be injected into the Handlebars HTML template',
    example: {
      title: "You successfully sent you're first notification!",
      firstName: 'John',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: any;
}
