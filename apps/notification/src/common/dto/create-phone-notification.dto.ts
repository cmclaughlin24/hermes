import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsTimeZone
} from 'class-validator';

export class CreatePhoneNotificationDto {
  @ApiProperty({
    description: 'Recipient of the notification',
    example: '+19999999999',
  })
  @IsPhoneNumber()
  to: string;

  @ApiProperty({
    description:
      "Verified phone number (defaults to environment's phone number)",
    example: '+19999999999',
  })
  @IsPhoneNumber()
  @IsOptional()
  from?: string;

  @ApiProperty({
    description:
      'Time zone to use when formatting dates/times (overridden if "context" property has a "timeZone" key)',
    example: 'America/Chicago',
    required: false,
  })
  @IsTimeZone()
  @IsOptional()
  timeZone?: string;

  @ApiProperty({
    description:
      'Message template that can accept values from a nested JavaScript object',
    example:
      '{{firstName}} {{lastName}} successfully sent a {{message.type}} notification!',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  body?: string;

  @ApiProperty({
    description: 'Name of phone template (overrides "body" property if provided)',
    example: 'order-confirmation',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  template?: string;

  @ApiProperty({
    description: 'Values to be injected into the message template',
    example: {
      firstName: 'John',
      lastName: 'Doe',
      message: {
        type: 'sms',
      },
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: any;
}
