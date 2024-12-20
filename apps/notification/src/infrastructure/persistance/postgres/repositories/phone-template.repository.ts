import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExistsException,
  MissingException,
  PhoneMethods,
} from '@hermes/common';
import { PhoneTemplate } from '../entities/phone-template.entity';
import { Repository } from 'typeorm';
import { CreatePhoneTemplateDto } from '../../../../resources/phone-template/dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from '../../../../resources/phone-template/dto/update-phone-template.dto';
import { PhoneTemplateRepository } from '../../../../resources/phone-template/repository/phone-template.repository';

@Injectable()
export class PostgresPhoneTemplateRepository
  implements PhoneTemplateRepository
{
  constructor(
    @InjectRepository(PhoneTemplate)
    private readonly phoneTemplateModel: Repository<PhoneTemplate>,
  ) {}

  findAll() {
    return this.phoneTemplateModel.find();
  }

  findOne(deliveryMethod: PhoneMethods, name: string) {
    return this.phoneTemplateModel.findOneBy({
      name,
      deliveryMethod,
    });
  }

  async create(createPhoneTemplateDto: CreatePhoneTemplateDto) {
    const existingTemplate = await this.phoneTemplateModel.findOneBy({
      name: createPhoneTemplateDto.name,
      deliveryMethod: createPhoneTemplateDto.deliveryMethod,
    });

    if (existingTemplate) {
      throw new ExistsException(
        `Phone template name=${createPhoneTemplateDto.name} for deliveryMethod=${createPhoneTemplateDto.deliveryMethod} already exists!`,
      );
    }

    const phoneTemplate = this.phoneTemplateModel.create(
      createPhoneTemplateDto,
    );

    return this.phoneTemplateModel.save(phoneTemplate);
  }

  async update(
    deliveryMethod: PhoneMethods,
    name: string,
    updatePhoneTemplateDto: UpdatePhoneTemplateDto,
  ) {
    const phoneTemplate = await this.phoneTemplateModel.preload({
      name,
      deliveryMethod,
      ...updatePhoneTemplateDto,
    });

    if (!phoneTemplate) {
      throw new MissingException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    return this.phoneTemplateModel.save(phoneTemplate);
  }

  async remove(deliveryMethod: PhoneMethods, name: string) {
    const phoneTemplate = await this.phoneTemplateModel.findOneBy({
      name,
      deliveryMethod,
    });

    if (!phoneTemplate) {
      throw new MissingException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    await this.phoneTemplateModel.remove(phoneTemplate);
  }
}
