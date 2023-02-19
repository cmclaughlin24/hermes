import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty({
    description: 'Name of the email template',
    example: 'template'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Handlebars HTML template that can used when an email is sent',
    example: '<body><main><h1>{{firstName}} {{lastName}}</h1></main></body>',
  })
  @IsString()
  template: string;

  @ApiProperty({
    description:
      'Example of the values to be passed to the template by Handlebars',
    example: { firstName: 'string', lastName: 'string' },
  })
  @IsObject()
  context: any;
}
