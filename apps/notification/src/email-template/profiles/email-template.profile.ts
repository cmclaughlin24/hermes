import {
  type Mapper,
  MappingProfile,
  createMap,
  forMember,
  mapFrom,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { EmailTemplate } from '../domain/email-template';
import { EmailTemplateEntity } from '../repository/entities/email-template.entity';
import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';

@Injectable()
export class EmailTemplateProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      // NOTE: Map CreateEmailTemplateDto -> EmailTemplate
      createMap(
        mapper,
        CreateEmailTemplateDto,
        EmailTemplate,
        forMember(
          (destination) => destination.context,
          mapFrom((source) => source.context),
        ),
      );

      // NOTE: Map EmailTemplate -> EmailTemplateEntity
      createMap(
        mapper,
        EmailTemplate,
        EmailTemplateEntity,
        forMember(
          (destination) => destination.context,
          mapFrom((source) => source.context),
        ),
      );

      // NOTE: Map EmailTemplateEntity -> EmailTemplate
      createMap(
        mapper,
        EmailTemplateEntity,
        EmailTemplate,
        forMember(
          (destination) => destination.context,
          mapFrom((source) => source.context),
        ),
      );
    };
  }
}
