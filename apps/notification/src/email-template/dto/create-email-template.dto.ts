import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty({
    description: 'Name of the email template',
    example: 'template',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ApiProperty({
    description:
      'Subject template that can accept values from a nested JavaScript object',
    example: 'Order Confirmation for {{product.type}}',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  subject: string;

  @ApiProperty({
    description:
      'Handlebars HTML template that can used when an email is sent. Date formatting ' +
      'supported through the "formatDate" Handlerbars helper.',
    example:
      '<body><main><h1>{{firstName}} {{lastName}} placed an order on {{ formatDate receivedOn timeZone format }}!</h1></main></body>',
    externalDocs: {
      url: 'https://handlebarsjs.com/',
      description: 'Handlebars',
    },
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  template: string;

  @ApiProperty({
    description:
      'Example of the values to be passed to the template by Handlebars',
    example: {
      firstName: 'string',
      lastName: 'string',
      product: { type: 'string' },
    },
  })
  @IsObject()
  context: any;
}
