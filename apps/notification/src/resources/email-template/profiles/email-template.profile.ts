import { type Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { EmailTemplate } from '../domain/email-template';
import { EmailTemplateEntity } from '../repository/entities/email-template.entity';

@Injectable()
export class EmailTemplateProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      // NOTE: Map EmailTemplate -> EmailTemplateEntity
      createMap(mapper, EmailTemplate, EmailTemplateEntity);

      // NOTE: Map EmailTemplateEntity -> EmailTemplate
      createMap(mapper, EmailTemplateEntity, EmailTemplate);
    };
  }
}
