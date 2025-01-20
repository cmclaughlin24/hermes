import { Injectable } from '@nestjs/common';
import { EmailTemplate } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';

@Injectable()
export abstract class EmailTemplateRepository {
  abstract findAll(): Promise<EmailTemplate[]>;
  abstract findOne(name: string): Promise<EmailTemplate>;
  abstract create(
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplate>;
  abstract update(
    name: string,
    updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate>;
  abstract remove(name: string): Promise<void>;
}
