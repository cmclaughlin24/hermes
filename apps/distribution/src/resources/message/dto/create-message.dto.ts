import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { MessageDto } from '../../../common/dto/message.dto';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  exchange: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  routingKey: string;

  @ValidateNested()
  @Type(() => MessageDto)
  message: MessageDto;
}
