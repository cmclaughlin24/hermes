import { InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class DeliveryWindowInput {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  @Max(23)
  atHour: number;

  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  @Max(59)
  atMinute: number;

  @IsNumber()
  @Min(1)
  duration: number;
}
