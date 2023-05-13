import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '@notification/common';
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

  async findAll() {
    const phoneTemplates = await this.phoneTemplateModel.findAll();

    if (_.isEmpty(phoneTemplates)) {
      throw new NotFoundException('Phone templates not found!');
    }

    return phoneTemplates;
  }

  async findOne(name: string) {
    const phoneTemplate = await this.phoneTemplateModel.findByPk(name);

    if (!phoneTemplate) {
      throw new NotFoundException(`Phone template name=${name} not found!`);
    }

    return phoneTemplate;
  }

  async create(createPhoneTemplateDto: CreatePhoneTemplateDto) {
    const existingTemplate = await this.phoneTemplateModel.findByPk(
      createPhoneTemplateDto.name,
    );

    if (existingTemplate) {
      throw new BadRequestException(
        `Phone template name=${createPhoneTemplateDto.name} already exists!`,
      );
    }

    const phoneTemplate = await this.phoneTemplateModel.create({
      ...createPhoneTemplateDto,
    });

    return new ApiResponseDto<PhoneTemplate>(
      `Successfully created phone template ${phoneTemplate.name}`,
      phoneTemplate,
    );
  }

  async update(name: string, updatePhoneTemplateDto: UpdatePhoneTemplateDto) {
    let phoneTemplate = await this.phoneTemplateModel.findByPk(name);

    if (!phoneTemplate) {
      throw new NotFoundException(`Phone template name=${name} not found!`);
    }

    // Fixme: Only update parameters with defined values.
    phoneTemplate = await phoneTemplate.update({ ...updatePhoneTemplateDto });

    return new ApiResponseDto<PhoneTemplate>(
      `Successfully updated phone template ${phoneTemplate.name}`,
      phoneTemplate,
    );
  }

  async remove(name: string) {
    const phoneTemplate = await this.phoneTemplateModel.findByPk(name);

    if (!phoneTemplate) {
      throw new NotFoundException(`Phone template name=${name} not found!`);
    }

    await phoneTemplate.destroy();

    return new ApiResponseDto(`Successfully deleted phone template ${name}!`);
  }
}
