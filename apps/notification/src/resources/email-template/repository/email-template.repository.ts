import { Injectable } from '@nestjs/common';
import { EmailTemplateEntity } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';

@Injectable()
export abstract class EmailTemplateRepository {
  abstract findAll(): Promise<EmailTemplateEntity[]>;
  abstract findOne(name: string): Promise<EmailTemplateEntity>;
  abstract create(
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplateEntity>;
  abstract update(
    name: string,
    updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateEntity>;
  abstract remove(name: string): Promise<void>;
}
