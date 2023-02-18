import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EmailTemplate } from './entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectModel(EmailTemplate)
    private readonly emailTemplateModel: typeof EmailTemplate,
  ) {}

  findAll() {}

  async findOne(name: string) {
    const emailTemplate = await this.emailTemplateModel.findByPk(name);

    if (!emailTemplate) {
      throw new NotFoundException(`Email Template with ${name} not found!`);
    }

    return emailTemplate;
  }

  create(createEmailTemplateDto: any) {}

  update(name: string, updateEmailTemplateDto: any) {}

  remove(name: string) {}
}
