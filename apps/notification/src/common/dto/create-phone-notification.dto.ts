import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
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
    description: 'Message template that can accept values from a nested JavaScript object',
    example: '{{firstName}} {{lastName}} successfully sent a {{message.type}} notification!',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  body: string;

  @ApiProperty({
    description: 'Values to be injected into the message template',
    example: {
      firstName: 'John',
      lastName: 'Doe',
      message: {
        type: 'sms'
      }
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: any;
}
