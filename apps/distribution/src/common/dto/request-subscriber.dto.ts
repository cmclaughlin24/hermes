import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class RequestSubscriberDto {
  @ApiProperty({
    description: ''
  })
  @IsUrl({
    protocols: ['http', 'https'],
    require_tld: false,
  })
  url: string;

  // Note: The id property is set when a Subscription is reduced to the RequestSubscriberDto class, hence it is hidden
  //       from the OpenAPI Documentation.
  @ApiHideProperty()
  @IsString()
  id?: string;
}
