import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PhoneTemplateService } from './phone-template.service';

@ApiTags('Phone Template')
@Controller('phone-template')
export class PhoneTemplateController {
  constructor(private readonly phoneTemplateService: PhoneTemplateService) {}
}
