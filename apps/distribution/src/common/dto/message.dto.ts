import { Transform, TransformFnParams } from 'class-transformer';
import { Allow, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class MessageDto {
  @IsUUID('4')
  id: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  type: string;

  @Allow()
  payload: any;
}
