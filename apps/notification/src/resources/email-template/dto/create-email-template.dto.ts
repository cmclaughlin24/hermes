import { IsObject, IsString } from 'class-validator';

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  template: string;

  @IsObject()
  context: any;
}
