import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { MessageDto } from '../../../common/dto/message.dto';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Rabbitmq Exchange responsible for routing the message.',
    example: 'image',
    externalDocs: {
      url: 'https://www.rabbitmq.com/tutorials/amqp-concepts.html',
      description: 'Rabbitmq Tutorial',
    },
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  exchange: string;

  @ApiProperty({
    description:
      'Message attribute the exchange looks at to determine how to route the message.',
    example: 'image.archive',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  routingKey: string;

  @ApiProperty({
    description: 'Message to be published.',
    type: MessageDto
  })
  @ValidateNested()
  @Type(() => MessageDto)
  message: MessageDto;
}
