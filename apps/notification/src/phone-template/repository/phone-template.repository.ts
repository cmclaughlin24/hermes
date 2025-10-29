import { Injectable } from '@nestjs/common';
import { PhoneMethods } from '@hermes/common';
import { CreatePhoneTemplateDto } from '../dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from '../dto/update-phone-template.dto';
import { PhoneTemplateEntity } from './entities/phone-template.entity';

@Injectable()
export abstract class PhoneTemplateRepository {
  abstract findAll(): Promise<PhoneTemplateEntity[]>;
  abstract findOne(
    deliveryMethod: PhoneMethods,
    name: string,
  ): Promise<PhoneTemplateEntity>;
  abstract create(
    createPhoneTemplateDto: CreatePhoneTemplateDto,
  ): Promise<PhoneTemplateEntity>;
  abstract update(
    deliveryMethod: PhoneMethods,
    name: string,
    updatePhoneTemplateDto: UpdatePhoneTemplateDto,
  ): Promise<PhoneTemplateEntity>;
  abstract remove(deliveryMethod: PhoneMethods, name: string): Promise<void>;
}
