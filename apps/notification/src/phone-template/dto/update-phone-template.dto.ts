import { OmitType } from '@nestjs/swagger';
import { CreatePhoneTemplateDto } from './create-phone-template.dto';

export class UpdatePhoneTemplateDto extends OmitType(CreatePhoneTemplateDto, [
  'name',
  'deliveryMethod',
]) {}
