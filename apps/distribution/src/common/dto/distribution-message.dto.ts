import { MessageDto } from '@hermes/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsTimeZone, ValidateNested } from 'class-validator';
import { SubscriptionMemberDto } from './subscription-member.dto';

export class DistributionMessageDto extends MessageDto {
  @ApiProperty({
    description:
      "IANA time zone used to format dates/times. If present, will override the value in the " +
      "NotificationDto instead of setting the user's time zone.",
  })
  @IsTimeZone()
  @IsOptional()
  timeZone?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => SubscriptionMemberDto)
  recipients?: SubscriptionMemberDto[];
}
