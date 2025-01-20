import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExistsException, MissingException } from '@hermes/common';
import { Repository } from 'typeorm';
import { EmailTemplateRepository } from './email-template.repository';
import { EmailTemplate } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';

@Injectable()
export class PostgresEmailTemplateRepository
  implements EmailTemplateRepository
{
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateModel: Repository<EmailTemplate>,
  ) {}

  async findAll() {
    return this.emailTemplateModel.find();
  }

  async findOne(name: string) {
    return this.emailTemplateModel.findOneBy({ name });
  }

  async create(createEmailTemplateDto: CreateEmailTemplateDto) {
    const existingTemplate = await this.emailTemplateModel.findOneBy({
      name: createEmailTemplateDto.name,
    });

    if (existingTemplate) {
      throw new ExistsException(
        `Email Template ${createEmailTemplateDto.name} already exists!`,
      );
    }

    const emailTemplate = this.emailTemplateModel.create(
      createEmailTemplateDto,
    );

    return this.emailTemplateModel.save(emailTemplate);
  }

  async update(name: string, updateEmailTemplateDto: UpdateEmailTemplateDto) {
    const emailTemplate = await this.emailTemplateModel.preload({
      name,
      ...updateEmailTemplateDto,
    });

    if (!emailTemplate) {
      throw new MissingException(`Email Template ${name} not found!`);
    }

    return this.emailTemplateModel.save(emailTemplate);
  }

  async remove(name: string) {
    const emailTemplate = await this.emailTemplateModel.findOneBy({
      name,
    });

    if (!emailTemplate) {
      throw new MissingException(`Email Template ${name} not found!`);
    }

    await this.emailTemplateModel.remove(emailTemplate);
  }
}

