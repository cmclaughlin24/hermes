import {
  ApiResponseDto,
  ExistsException,
  MissingException,
  PhoneMethods,
  RemoveCache,
  UseCache,
  defaultHashFn,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';
import { PhoneTemplate } from './entities/phone-template.entity';

@Injectable()
export class PhoneTemplateService {
  private static readonly CACHE_KEY = 'phone-template';

  constructor(
    @InjectRepository(PhoneTemplate)
    private readonly phoneTemplateRepository: Repository<PhoneTemplate>,
  ) {}

  /**
   * Yields a list of PhoneTemplates.
   * @returns {Promise<PhoneTemplate[]>}
   */
  findAll() {
    return this.phoneTemplateRepository.find();
  }

  /**
   * Yields a PhoneTemplate.
   * @param {PhoneTemplate} deliveryMethod
   * @param {string} name
   * @returns {Promise<PhoneTemplate>}
   */
  @UseCache({ key: PhoneTemplateService.CACHE_KEY })
  findOne(deliveryMethod: PhoneMethods, name: string) {
    return this.phoneTemplateRepository.findOneBy({
      name,
      deliveryMethod,
    });
  }

  /**
   * Creates a new PhoneTemplate or throws an ExistsException if a phone
   * template name for a phone delivery method exists in the repository.
   * @param {CreatePhoneTemplateDto} createPhoneTemplateDto
   * @returns {Promise<PhoneTemplate>}
   */
  async create(createPhoneTemplateDto: CreatePhoneTemplateDto) {
    const existingTemplate = await this.phoneTemplateRepository.findOneBy({
      name: createPhoneTemplateDto.name,
      deliveryMethod: createPhoneTemplateDto.deliveryMethod,
    });

    if (existingTemplate) {
      throw new ExistsException(
        `Phone template name=${createPhoneTemplateDto.name} for deliveryMethod=${createPhoneTemplateDto.deliveryMethod} already exists!`,
      );
    }

    const phoneTemplate = this.phoneTemplateRepository.create(
      createPhoneTemplateDto,
    );

    return this.phoneTemplateRepository.save(phoneTemplate);
  }

  /**
   * Updates a PhoneTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {PhoneMethods} deliveryMethod
   * @param {string} name
   * @param {UpdatePhoneTemplateDto} updatePhoneTemplateDto
   * @returns {Promise<ApiResponseDto<PhoneTemplate>>}
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
    const phoneTemplate = await this.phoneTemplateRepository.preload({
      name,
      deliveryMethod,
      ...updatePhoneTemplateDto,
    });

    if (!phoneTemplate) {
      throw new MissingException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    return this.phoneTemplateRepository.save(phoneTemplate);
  }

  /**
   * Removes a PhoneTemplate or throws a MissingException if the repository
   * return null or undefined.
   * @param {PhoneMethods} deliveryMethod
   * @param {string} name
   * @returns {Promise<ApiResponseDto}
   */
  @RemoveCache({ key: PhoneTemplateService.CACHE_KEY })
  async remove(deliveryMethod: PhoneMethods, name: string) {
    const phoneTemplate = await this.phoneTemplateRepository.findOneBy({
      name,
      deliveryMethod,
    });

    if (!phoneTemplate) {
      throw new MissingException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    await this.phoneTemplateRepository.remove(phoneTemplate);
  }
}
