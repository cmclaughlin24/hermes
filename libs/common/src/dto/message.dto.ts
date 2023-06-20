import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  Allow,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class MessageDto {
  @ApiProperty({
    description:
      'A Universal Unique Identifier (UUID4) identifying the individual message',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Name of the event that should be triggered by the message',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  type: string;

  @ApiProperty({
    description: '',
  })
  @Allow()
  payload: any;

  @ApiProperty({
    description:
      'Label selectors (key-value pairs) used to identify which rule should be applied for an ' +
      'event (for a rule to be selected, all selectors must match or the default rule will be applied)',
    example: {
      operation: 'add',
    },
  })
  @Allow()
  metadata: any;

  @ApiProperty({
    description: 'Timestamp when the message was added to the queue',
  })
  @IsDateString()
  addedAt: Date;
}
