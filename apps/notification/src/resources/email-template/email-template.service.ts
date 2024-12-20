import { RemoveCache, UseCache, defaultHashFn } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplateRepository } from './repository/email-template.repository';

@Injectable()
export class EmailTemplateService {
  private static readonly CACHE_KEY = 'email-template';

  constructor(
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  /**
   * Yields a list of EmailTemplates.
   */
  async findAll() {
    return this.emailTemplateRepository.findAll();
  }

  /**
   * Yields an EmailTemplate.
   * @param {string} name Template's name
   */
  @UseCache({ key: EmailTemplateService.CACHE_KEY })
  async findOne(name: string) {
    return this.emailTemplateRepository.findOne(name);
  }

  /**
   * Creates a new EmailTemplate or throws a ExistsException if an email
   * template name exists in the repository.
   * @param {CreateEmailTemplateDto} createEmailTemplateDto
   */
  async create(createEmailTemplateDto: CreateEmailTemplateDto) {
    return this.emailTemplateRepository.create(createEmailTemplateDto);
  }

  /**
   * Updates an EmailTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @param {UpdateEmailTemplateDto} updateEmailTemplateDto
   */
  @RemoveCache({
    key: EmailTemplateService.CACHE_KEY,
    hashFn: (key: string, args: any[]) => defaultHashFn(key, [args[0]]),
  })
  async update(name: string, updateEmailTemplateDto: UpdateEmailTemplateDto) {
    return this.emailTemplateRepository.update(name, updateEmailTemplateDto);
  }

  /**
   * Removes an EmailTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   */
  @RemoveCache({ key: EmailTemplateService.CACHE_KEY })
  async remove(name: string) {
    await this.emailTemplateRepository.remove(name);
  }
}
