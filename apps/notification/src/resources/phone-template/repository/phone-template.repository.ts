import { Injectable } from '@nestjs/common';
import { PhoneMethods } from '@hermes/common';
import { CreatePhoneTemplateDto } from '../dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from '../dto/update-phone-template.dto';
import { PhoneTemplate } from '../../../infrastructure/persistance/postgres/entities/phone-template.entity';

@Injectable()
export abstract class PhoneTemplateRepository {
  abstract findAll(): Promise<PhoneTemplate[]>;
  abstract findOne(
    deliveryMethod: PhoneMethods,
    name: string,
  ): Promise<PhoneTemplate>;
  abstract create(
    createPhoneTemplateDto: CreatePhoneTemplateDto,
  ): Promise<PhoneTemplate>;
  abstract update(
    deliveryMethod: PhoneMethods,
    name: string,
    updatePhoneTemplateDto: UpdatePhoneTemplateDto,
  ): Promise<PhoneTemplate>;
  abstract remove(deliveryMethod: PhoneMethods, name: string): Promise<void>;
}
