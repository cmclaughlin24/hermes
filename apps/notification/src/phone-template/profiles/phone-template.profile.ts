import {
  type Mapper,
  MappingProfile,
  createMap,
  forMember,
  mapFrom,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PhoneTemplateEntity } from '../repository/entities/phone-template.entity';
import { PhoneTemplate } from '../domain/phone-template';
import { CreatePhoneTemplateDto } from '../dto/create-phone-template.dto';

@Injectable()
export class PhoneTemplateProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      // NOTE: Map CreatePhoneTemplateDto -> PhoneTemplate
      createMap(
        mapper,
        CreatePhoneTemplateDto,
        PhoneTemplate,
        forMember(
          (destination) => destination.context,
          mapFrom((source) => source.context),
        ),
      );

      // NOTE: Map PhoneTemplate -> PhoneTemplateEntity
      createMap(
        mapper,
        PhoneTemplate,
        PhoneTemplateEntity,
        forMember(
          (destination) => destination.context,
          mapFrom((source) => source.context),
        ),
      );

      // NOTE: Map PhoneTemplateEntity -> PhoneTemplate
      createMap(
        mapper,
        PhoneTemplateEntity,
        PhoneTemplate,
        forMember(
          (destination) => destination.context,
          mapFrom((source) => source.context),
        ),
      );
    };
  }
}
