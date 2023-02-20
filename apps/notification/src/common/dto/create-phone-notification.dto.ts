import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString
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
  from: string;

  @ApiProperty({
    description: "Notification's content",
    example: "You successfully sent you're first notification!",
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  body: string;
}
