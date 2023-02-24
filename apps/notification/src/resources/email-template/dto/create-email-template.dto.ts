import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty({
    description: 'Name of the email template',
    example: 'template'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Handlebars HTML template that can used when an email is sent',
    example: '<body><main><h1>{{firstName}} {{lastName}}</h1></main></body>',
    externalDocs: {
      url: 'https://handlebarsjs.com/',
      description: 'Handlebars'
    },
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  template: string;

  @ApiProperty({
    description:
      'Example of the values to be passed to the template by Handlebars',
    example: { firstName: 'string', lastName: 'string' },
  })
  @IsObject()
  context: any;
}
