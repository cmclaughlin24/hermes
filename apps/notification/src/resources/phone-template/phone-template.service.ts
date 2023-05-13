import { Injectable } from '@nestjs/common';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';

@Injectable()
export class PhoneTemplateService {
  findAll() {}

  findOne(name: string) {}

  create(createPhoneTemplateDto: CreatePhoneTemplateDto) {}

  update(name: string, updatePhoneTemplateDto: UpdatePhoneTemplateDto) {}

  remove(name: string) {}
}
