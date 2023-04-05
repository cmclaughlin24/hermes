import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '@notification/common';
import * as _ from 'lodash';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplate } from './entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectModel(EmailTemplate)
    private readonly emailTemplateModel: typeof EmailTemplate,
  ) {}

  /**
   * Yields a list of EmailTemplates or throws a NotFoundException if
   * the repository returns null, undefined, or an empty list.
   * @returns {Promise<EmailTemplate[]>}
   */
  async findAll() {
    const emailTemplates = await this.emailTemplateModel.findAll();

    if (_.isEmpty(emailTemplates)) {
      throw new NotFoundException(`Email templates not found!`);
    }

    return emailTemplates;
  }

  /**
   * Yields an EmailTemplate or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} name Template's name
   * @returns {Promise<EmailTemplate>}
   */
  async findOne(name: string) {
    const emailTemplate = await this.emailTemplateModel.findByPk(name);

    if (!emailTemplate) {
      throw new NotFoundException(`Email Template with ${name} not found!`);
    }

    return emailTemplate;
  }

  /**
   * Creates a new EmailTemplate or throws a BadRequestException if an
   * email template name exists in the repository.
   * @param {CreateEmailTemplateDto} createEmailTemplateDto
   * @returns {Promise<ApiResponseDto<EmailTemplate>>}
   */
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

    return new ApiResponseDto<EmailTemplate>(
      `Successfully created email template ${emailTemplate.name}!`,
      emailTemplate,
    );
  }

  /**
   * Updates an EmailTemplate or throws a NotFoundException if the
   * repository null or undefined.
   * @param {string} name Template's name
   * @param {UpdateEmailTemplateDto} updateEmailTemplateDto
   * @returns {Promise<ApiResponseDto<EmailTemplate>>}
   */
  async update(name: string, updateEmailTemplateDto: UpdateEmailTemplateDto) {
    let emailTemplate = await this.emailTemplateModel.findByPk(name);

    if (!emailTemplate) {
      throw new NotFoundException(`Email Template with ${name} not found!`);
    }

    emailTemplate = await emailTemplate.update({
      template: updateEmailTemplateDto.template || emailTemplate.template,
      context: updateEmailTemplateDto.context || emailTemplate.context,
    });

    return new ApiResponseDto<EmailTemplate>(
      `Successfully updated email template ${emailTemplate.name}!`,
      emailTemplate,
    );
  }

  /**
   * Removes an EmailTemplate or throws a NotFoundException if the
   * repository null or undefined.
   * @param {string} name Template's name
   * @returns {Promise<ApiResponseDto>}
   */
  async remove(name: string) {
    const emailTemplate = await this.emailTemplateModel.findByPk(name);

    if (!emailTemplate) {
      throw new NotFoundException(`Email Template with ${name} not found!`);
    }

    await emailTemplate.destroy();

    return new ApiResponseDto(`Successfully deleted email template ${name}!`);
  }
}
