import {
  ExistsException,
  MissingException,
  RemoveCache,
  UseCache,
  defaultHashFn,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplate } from './entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  private static readonly CACHE_KEY = 'email-template';

  constructor(
    @InjectModel(EmailTemplate)
    private readonly emailTemplateModel: typeof EmailTemplate,
  ) {}

  /**
   * Yields a list of EmailTemplates.
   * @returns {Promise<EmailTemplate[]>}
   */
  async findAll() {
    return this.emailTemplateModel.findAll();
  }

  /**
   * Yields an EmailTemplate.
   * @param {string} name Template's name
   * @returns {Promise<EmailTemplate>}
   */
  @UseCache({ key: EmailTemplateService.CACHE_KEY })
  async findOne(name: string) {
    return this.emailTemplateModel.findByPk(name);
  }

  /**
   * Creates a new EmailTemplate or throws a ExistsException if an email
   * template name exists in the repository.
   * @param {CreateEmailTemplateDto} createEmailTemplateDto
   * @returns {Promise<EmailTemplate>}
   */
  async create(createEmailTemplateDto: CreateEmailTemplateDto) {
    const existingTemplate = await this.emailTemplateModel.findByPk(
      createEmailTemplateDto.name,
    );

    if (existingTemplate) {
      throw new ExistsException(
        `Email Template ${createEmailTemplateDto.name} already exists!`,
      );
    }

    const emailTemplate = await this.emailTemplateModel.create({
      ...createEmailTemplateDto,
    });

    return emailTemplate;
  }

  /**
   * Updates an EmailTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @param {UpdateEmailTemplateDto} updateEmailTemplateDto
   * @returns {Promise<EmailTemplate>}
   */
  @RemoveCache({
    key: EmailTemplateService.CACHE_KEY,
    hashFn: (key: string, args: any[]) => defaultHashFn(key, [args[0]]),
  })
  async update(name: string, updateEmailTemplateDto: UpdateEmailTemplateDto) {
    let emailTemplate = await this.emailTemplateModel.findByPk(name);

    if (!emailTemplate) {
      throw new MissingException(`Email Template ${name} not found!`);
    }

    emailTemplate = await emailTemplate.update({
      subject: updateEmailTemplateDto.subject ?? emailTemplate.subject,
      template: updateEmailTemplateDto.template ?? emailTemplate.template,
      context: updateEmailTemplateDto.context ?? emailTemplate.context,
    });

    return emailTemplate;
  }

  /**
   * Removes an EmailTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @returns {Promise<void>}
   */
  @RemoveCache({ key: EmailTemplateService.CACHE_KEY })
  async remove(name: string) {
    const emailTemplate = await this.emailTemplateModel.findByPk(name);

    if (!emailTemplate) {
      throw new MissingException(`Email Template ${name} not found!`);
    }

    await emailTemplate.destroy();
  }
}
