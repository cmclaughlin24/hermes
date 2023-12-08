import {
  ExistsException,
  MissingException,
  RemoveCache,
  UseCache,
  defaultHashFn,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplate } from './entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  private static readonly CACHE_KEY = 'email-template';

  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  /**
   * Yields a list of EmailTemplates.
   * @returns {Promise<EmailTemplate[]>}
   */
  async findAll() {
    return this.emailTemplateRepository.find();
  }

  /**
   * Yields an EmailTemplate.
   * @param {string} name Template's name
   * @returns {Promise<EmailTemplate>}
   */
  @UseCache({ key: EmailTemplateService.CACHE_KEY })
  async findOne(name: string) {
    return this.emailTemplateRepository.findOneBy({ name });
  }

  /**
   * Creates a new EmailTemplate or throws a ExistsException if an email
   * template name exists in the repository.
   * @param {CreateEmailTemplateDto} createEmailTemplateDto
   * @returns {Promise<EmailTemplate>}
   */
  async create(createEmailTemplateDto: CreateEmailTemplateDto) {
    const existingTemplate = await this.emailTemplateRepository.findOneBy({
      name: createEmailTemplateDto.name,
    });

    if (existingTemplate) {
      throw new ExistsException(
        `Email Template ${createEmailTemplateDto.name} already exists!`,
      );
    }

    const emailTemplate = this.emailTemplateRepository.create(
      createEmailTemplateDto,
    );

    return this.emailTemplateRepository.save(emailTemplate);
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
    const emailTemplate = await this.emailTemplateRepository.preload({
      name,
      ...updateEmailTemplateDto,
    });

    if (!emailTemplate) {
      throw new MissingException(`Email Template ${name} not found!`);
    }

    return this.emailTemplateRepository.save(emailTemplate);
  }

  /**
   * Removes an EmailTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @returns {Promise<void>}
   */
  @RemoveCache({ key: EmailTemplateService.CACHE_KEY })
  async remove(name: string) {
    const emailTemplate = await this.emailTemplateRepository.findOneBy({
      name,
    });

    if (!emailTemplate) {
      throw new MissingException(`Email Template ${name} not found!`);
    }

    await this.emailTemplateRepository.remove(emailTemplate);
  }
}
