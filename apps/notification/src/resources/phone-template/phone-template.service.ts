import {
  PhoneMethods,
  RemoveCache,
  UseCache,
  defaultHashFn,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';
import { PhoneTemplateRepository } from './repository/phone-template.repository';

@Injectable()
export class PhoneTemplateService {
  private static readonly CACHE_KEY = 'phone-template';

  constructor(
    private readonly phoneTemplateRepository: PhoneTemplateRepository,
  ) {}

  /**
   * Yields a list of PhoneTemplates.
   */
  findAll() {
    return this.phoneTemplateRepository.findAll();
  }

  /**
   * Yields a PhoneTemplate.
   * @param {PhoneTemplate} deliveryMethod
   * @param {string} name
   */
  @UseCache({ key: PhoneTemplateService.CACHE_KEY })
  findOne(deliveryMethod: PhoneMethods, name: string) {
    return this.phoneTemplateRepository.findOne(deliveryMethod, name);
  }

  /**
   * Creates a new PhoneTemplate or throws an ExistsException if a phone
   * template name for a phone delivery method exists in the repository.
   * @param {CreatePhoneTemplateDto} createPhoneTemplateDto
   */
  async create(createPhoneTemplateDto: CreatePhoneTemplateDto) {
    return this.phoneTemplateRepository.create(createPhoneTemplateDto);
  }

  /**
   * Updates a PhoneTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {PhoneMethods} deliveryMethod
   * @param {string} name
   * @param {UpdatePhoneTemplateDto} updatePhoneTemplateDto
   */
  @RemoveCache({
    key: PhoneTemplateService.CACHE_KEY,
    hashFn: (key, args) => defaultHashFn(key, [args[0], args[1]]),
  })
  async update(
    deliveryMethod: PhoneMethods,
    name: string,
    updatePhoneTemplateDto: UpdatePhoneTemplateDto,
  ) {
    return this.phoneTemplateRepository.update(
      deliveryMethod,
      name,
      updatePhoneTemplateDto,
    );
  }

  /**
   * Removes a PhoneTemplate or throws a MissingException if the repository
   * return null or undefined.
   * @param {PhoneMethods} deliveryMethod
   * @param {string} name
   */
  @RemoveCache({ key: PhoneTemplateService.CACHE_KEY })
  async remove(deliveryMethod: PhoneMethods, name: string) {
    await this.phoneTemplateRepository.remove(deliveryMethod, name);
  }
}
