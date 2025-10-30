import {
  type Mapper,
  MappingProfile,
  createMap,
  mapFrom,
  forMember,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NotificationLog } from '../domain/notification-log';
import { NotificationLogEntity } from '../repository/entities/notification-log.entity';

@Injectable()
export class NotificationLogProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      // NOTE: Map NotificationLog -> NotificationLogEntity
      createMap(mapper, NotificationLog, NotificationLogEntity);

      // NOTE: Map NotificationLogEntity -> NotificationLog
      createMap(
        mapper,
        NotificationLogEntity,
        NotificationLog,
        forMember(
          (destination) => destination.data,
          mapFrom((source) =>
            typeof source.data === 'string'
              ? JSON.parse(source.data)
              : source.data,
          ),
        ),
      );
    };
  }
}
