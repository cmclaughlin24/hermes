import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePushTemplateDto } from './create-push-template.dto';

export class UpdatePushTemplateDto extends PartialType(
  OmitType(CreatePushTemplateDto, ['name']),
) {}
