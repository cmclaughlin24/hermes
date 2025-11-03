import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class DeliveryWindowInput {
  @Field(() => ID, {
    description:
      'A universial unique identifier (UUID) that identifies a unique ' +
      'delivery window. Allows a user to specify multiple delivery windows ' +
      'on the same day of the week. Field is not required when creating new ' +
      'delivery windows.',
  })
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @Field({
    description:
      'An integer, between 0 and 6, representing the day of the week where ' +
      'Sunday is 0 and Saturday is 6.',
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @Field({
    description:
      'An integer, between 0 and 23, representing the hour at which the ' +
      'delivery window starts.',
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  @Max(23)
  atHour: number;

  @Field({
    description:
      'An integer, between 0 and 59, representing the minutes past the hour ' +
      'the delivery window starts.',
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  @Max(59)
  atMinute: number;

  @Field({
    description:
      'An integer, greater than 0, representing the length of the delivery ' +
      'window in minutes.',
  })
  @IsNumber()
  @Min(1)
  duration: number;
}
