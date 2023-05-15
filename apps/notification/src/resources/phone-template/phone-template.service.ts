import { ApiResponseDto, PhoneMethods } from '@hermes/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';
import { PhoneTemplate } from './entities/phone-template.entity';

@Injectable()
export class PhoneTemplateService {
  constructor(
    @InjectModel(PhoneTemplate)
    private readonly phoneTemplateModel: typeof PhoneTemplate,
  ) {}

  /**
   * Yields a list of PhoneTemplates or throws a NotFoundException if
   * the repository returns null, undefined, or an empty list.
   * @returns {Promise<PhoneTemplate[]>}
   */
  async findAll() {
    const phoneTemplates = await this.phoneTemplateModel.findAll();

    if (_.isEmpty(phoneTemplates)) {
      throw new NotFoundException('Phone templates not found!');
    }

    return phoneTemplates;
  }

  /**
   * Yields a PhoneTemplate or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {PhoneTemplate} deliveryMethod
   * @param {string} name 
   * @returns {Promise<PhoneTemplate>}
   */
  async findOne(deliveryMethod: PhoneMethods, name: string) {
    const phoneTemplate = await this.phoneTemplateModel.findOne({
      where: { name, deliveryMethod },
    });

    if (!phoneTemplate) {
      throw new NotFoundException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    return phoneTemplate;
  }

  /**
   * Creates a new PhoneTemplate or throws a BadRequestException if a phone
   * template name for a phone delivery method exists in the repository.
   * @param {CreatePhoneTemplateDto} createPhoneTemplateDto
   * @returns {Promise<ApiResponseDto<PhoneTemplate>>}
   */
  async create(createPhoneTemplateDto: CreatePhoneTemplateDto) {
    const existingTemplate = await this.phoneTemplateModel.findOne({
      where: {
        name: createPhoneTemplateDto.name,
        deliveryMethod: createPhoneTemplateDto.deliveryMethod,
      },
    });

    if (existingTemplate) {
      throw new BadRequestException(
        `Phone template name=${createPhoneTemplateDto.name} for deliveryMethod=${createPhoneTemplateDto.deliveryMethod} already exists!`,
      );
    }

    const phoneTemplate = await this.phoneTemplateModel.create({
      ...createPhoneTemplateDto,
    });

    return new ApiResponseDto<PhoneTemplate>(
      `Successfully created phone template ${phoneTemplate.name}!`,
      phoneTemplate,
    );
  }

  /**
   * Updates a PhoneTemplate or throws a NotFoundException if the
   * repository returns null or undefined.
   * @param {PhoneMethods} deliveryMethod
   * @param {string} name
   * @param {UpdatePhoneTemplateDto} updatePhoneTemplateDto
   * @returns {Promise<ApiResponseDto<PhoneTemplate>>}
   */
  async update(
    deliveryMethod: PhoneMethods,
    name: string,
    updatePhoneTemplateDto: UpdatePhoneTemplateDto,
  ) {
    let phoneTemplate = await this.phoneTemplateModel.findOne({
      where: { name, deliveryMethod },
    });

    if (!phoneTemplate) {
      throw new NotFoundException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    phoneTemplate = await phoneTemplate.update({
      template: updatePhoneTemplateDto.template ?? phoneTemplate.template,
      context: updatePhoneTemplateDto.context,
    });

    return new ApiResponseDto<PhoneTemplate>(
      `Successfully updated phone template ${phoneTemplate.name}`,
      phoneTemplate,
    );
  }

  /**
   * Removes a PhoneTemplate or throws a NotFoundException if the repository
   * return null or undefined.
   * @param {PhoneMethods} deliveryMethod
   * @param {string} name
   * @returns {Promise<ApiResponseDto}
   */
  async remove(deliveryMethod: PhoneMethods, name: string) {
    const phoneTemplate = await this.phoneTemplateModel.findOne({
      where: { name, deliveryMethod },
    });

    if (!phoneTemplate) {
      throw new NotFoundException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    await phoneTemplate.destroy();

    return new ApiResponseDto(`Successfully deleted phone template ${name}!`);
  }
}
