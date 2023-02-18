import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplate } from './entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectModel(EmailTemplate)
    private readonly emailTemplateModel: typeof EmailTemplate,
  ) {}

  async findAll() {
    const emailTemplates = await this.emailTemplateModel.findAll();

    if (!emailTemplates || emailTemplates.length === 0) {
      throw new NotFoundException(`Email templates not found!`);
    }

    return emailTemplates;
  }

  async findOne(name: string) {
    const emailTemplate = await this.emailTemplateModel.findByPk(name);

    if (!emailTemplate) {
      throw new NotFoundException(`Email Template with ${name} not found!`);
    }

    return emailTemplate;
  }

  async create(createEmailTemplateDto: CreateEmailTemplateDto) {
    const existingTemplate = await this.emailTemplateModel.findByPk(
      createEmailTemplateDto.name,
    );

    if (existingTemplate) {
      throw new BadRequestException(
        `Email Template ${createEmailTemplateDto.name} already exists!`,
      );
    }

    const emailTemplate = await this.emailTemplateModel.create({
      ...createEmailTemplateDto,
    });

    return new ApiResponseDto(
      `Successfully created email template ${emailTemplate.name}!`,
      emailTemplate,
    );
  }

  async update(name: string, updateEmailTemplateDto: UpdateEmailTemplateDto) {
    let emailTemplate = await this.emailTemplateModel.findByPk(name);

    if (!emailTemplate) {
      throw new NotFoundException(`Email Template with ${name} not found!`);
    }

    emailTemplate = await emailTemplate.update({
      template: updateEmailTemplateDto.template || emailTemplate.template,
      context: updateEmailTemplateDto.context || emailTemplate.context,
    });

    return new ApiResponseDto(
      `Successfully updated email template ${emailTemplate.name}`,
      emailTemplate,
    );
  }

  async remove(name: string) {
    const emailTemplate = await this.emailTemplateModel.findByPk(name);

    if (!emailTemplate) {
      throw new NotFoundException(`Email Template with ${name} not found!`);
    }

    return new ApiResponseDto(`Successfully deleted email template ${name}`);
  }
}
