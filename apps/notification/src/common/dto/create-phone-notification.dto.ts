import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreatePhoneNotificationDto {
  @IsPhoneNumber()
  to: string;

  @IsPhoneNumber()
  @IsOptional()
  from: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  body: string;
}