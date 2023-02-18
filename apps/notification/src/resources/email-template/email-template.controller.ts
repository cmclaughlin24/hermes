import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailTemplateService } from './email-template.service';

@ApiTags('Email Template')
@Controller('email-template')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}
}
