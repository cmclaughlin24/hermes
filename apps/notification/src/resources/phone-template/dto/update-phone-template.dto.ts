import { PartialType } from '@nestjs/swagger';
import { CreatePhoneTemplateDto } from './create-phone-template.dto';

export class UpdatePhoneTemplateDto extends PartialType(
  CreatePhoneTemplateDto,
) {}
