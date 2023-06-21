import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class RequestSubscriptionDto {
  @ApiProperty({
    description: ''
  })
  @IsUrl({
    protocols: ['http', 'https'],
    require_tld: false,
  })
  url: string;

  @ApiHideProperty()
  @IsString()
  id: string;
}
