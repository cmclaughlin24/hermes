import { Transform, TransformFnParams } from 'class-transformer';
import { Allow, IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  type: string;

  @Allow()
  payload: {};
}