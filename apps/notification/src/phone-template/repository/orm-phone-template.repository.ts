import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExistsException,
  MissingException,
  PhoneMethods,
} from '@hermes/common';
import { PhoneTemplateEntity } from './entities/phone-template.entity';
import { Repository } from 'typeorm';
import { CreatePhoneTemplateDto } from '../dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from '../dto/update-phone-template.dto';
import { PhoneTemplateRepository } from './phone-template.repository';
import { PhoneTemplate } from '../domain/phone-template';

@Injectable()
export class OrmPhoneTemplateRepository implements PhoneTemplateRepository {
  constructor(
    @InjectRepository(PhoneTemplateEntity)
    private readonly phoneTemplateModel: Repository<PhoneTemplateEntity>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async findAll() {
    return this.phoneTemplateModel
      .find()
      .then((entities) =>
        this.mapper.mapArray(entities, PhoneTemplateEntity, PhoneTemplate),
      );
  }

  async findOne(deliveryMethod: PhoneMethods, name: string) {
    return this.phoneTemplateModel
      .findOneBy({
        name,
        deliveryMethod,
      })
      .then((entity) => this._toDomain(entity));
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

    return this.phoneTemplateModel
      .save(phoneTemplate)
      .then((entity) => this._toDomain(entity));
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

    return this.phoneTemplateModel
      .save(phoneTemplate)
      .then((entity) => this._toDomain(entity));
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

  private _toDomain(entity: PhoneTemplateEntity): PhoneTemplate {
    return this.mapper.map(entity, PhoneTemplateEntity, PhoneTemplate);
  }
}
