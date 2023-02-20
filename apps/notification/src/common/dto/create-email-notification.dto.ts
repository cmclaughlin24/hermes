import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString
} from 'class-validator';
import { TemplateExists } from '../decorators/template-exists.decorator';

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
  from: string;

  @ApiProperty({
    description: 'Subject line for the email',
    example: 'My First Notification',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  subject: string;

  @ApiProperty({
    description: 'Plain text email body',
    example: "You successfully sent you're first notification!",
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  text: string;

  @ApiProperty({
    description:
      'Handlebars HTML template for the email body (overridden if "template" property is provided)',
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
  html: string;

  @ApiProperty({
    description:
      'Name of an email template (overrides "html" property if provided)',
    example: 'template',
    required: false,
  })
  @IsString()
  @IsOptional()
  @TemplateExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  template: string;

  @ApiProperty({
    description: 'Values to be based to the Handlebars HTML template',
    example: {
      title: "You successfully sent you're first notification!",
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context: any;
}
