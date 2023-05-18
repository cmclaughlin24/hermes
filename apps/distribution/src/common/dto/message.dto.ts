import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  Allow,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { SubscriptionMemberDto } from './subscription-member.dto';

export class MessageDto {
  @IsUUID('4')
  id: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  type: string;

  @Allow()
  payload: any;

  @Allow()
  metadata: any;

  @IsDateString()
  addedAt: Date;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => SubscriptionMemberDto)
  recipients?: SubscriptionMemberDto[];
}
