import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EmailTemplate } from './entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectModel(EmailTemplate) emailTemplateModel: typeof EmailTemplate,
  ) {}

  findAll() {}

  findOne(name: string) {}

  create(createEmailTemplateDto: any) {}

  update(name: string, updateEmailTemplateDto: any) {}

  remove(name: string) {}
}
