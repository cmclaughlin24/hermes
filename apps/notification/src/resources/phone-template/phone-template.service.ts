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
import { InjectModel } from '@nestjs/sequelize';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';
import { PhoneTemplate } from './entities/phone-template.entity';

@Injectable()
export class PhoneTemplateService {
  private static readonly CACHE_KEY = 'phone-template';

  constructor(
    @InjectModel(PhoneTemplate)
    private readonly phoneTemplateModel: typeof PhoneTemplate,
  ) {}

  /**
   * Yields a list of PhoneTemplates.
   * @returns {Promise<PhoneTemplate[]>}
   */
  findAll() {
    return this.phoneTemplateModel.findAll();
  }

  /**
   * Yields a PhoneTemplate.
   * @param {PhoneTemplate} deliveryMethod
   * @param {string} name
   * @returns {Promise<PhoneTemplate>}
   */
  @UseCache({ key: PhoneTemplateService.CACHE_KEY })
  findOne(deliveryMethod: PhoneMethods, name: string) {
    return this.phoneTemplateModel.findOne({
      where: { name, deliveryMethod },
    });
  }

  /**
   * Creates a new PhoneTemplate or throws an ExistsException if a phone
   * template name for a phone delivery method exists in the repository.
   * @param {CreatePhoneTemplateDto} createPhoneTemplateDto
   * @returns {Promise<PhoneTemplate>}
   */
  async create(createPhoneTemplateDto: CreatePhoneTemplateDto) {
    const existingTemplate = await this.phoneTemplateModel.findOne({
      where: {
        name: createPhoneTemplateDto.name,
        deliveryMethod: createPhoneTemplateDto.deliveryMethod,
      },
    });

    if (existingTemplate) {
      throw new ExistsException(
        `Phone template name=${createPhoneTemplateDto.name} for deliveryMethod=${createPhoneTemplateDto.deliveryMethod} already exists!`,
      );
    }

    const phoneTemplate = await this.phoneTemplateModel.create({
      ...createPhoneTemplateDto,
    });

    return phoneTemplate;
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
    hashFn: (key, args) => defaultHashFn(key, [args[0]]),
  })
  async update(
    deliveryMethod: PhoneMethods,
    name: string,
    updatePhoneTemplateDto: UpdatePhoneTemplateDto,
  ) {
    let phoneTemplate = await this.phoneTemplateModel.findOne({
      where: { name, deliveryMethod },
    });

    if (!phoneTemplate) {
      throw new MissingException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    phoneTemplate = await phoneTemplate.update({
      template: updatePhoneTemplateDto.template ?? phoneTemplate.template,
      context: updatePhoneTemplateDto.context,
    });

    return phoneTemplate;
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
    const phoneTemplate = await this.phoneTemplateModel.findOne({
      where: { name, deliveryMethod },
    });

    if (!phoneTemplate) {
      throw new MissingException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    await phoneTemplate.destroy();
  }
}
