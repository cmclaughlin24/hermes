import { type Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NotificationAttempt } from '../domain/notification-attempt';
import { NotificationAttemptEntity } from '../repository/entities/notification-attempt.entity';

@Injectable()
export class NotificationAttemptProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      // NOTE: Map NotificationAttempt -> NotificationAttemptEntity
      createMap(mapper, NotificationAttempt, NotificationAttemptEntity);

      // NOTE: Map NotificationAttemptEntity -> NotificationAttempt
      createMap(mapper, NotificationAttemptEntity, NotificationAttempt);
    };
  }
}
