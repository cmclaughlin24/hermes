import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import {
  mariaDabaseFactory,
  postgresDatabaseFactory,
} from '../../config/database.config';
import { EmailTemplate } from '../../resources/email-template/repository/entities/email-template.entity';
import { PhoneTemplate } from '../../resources/phone-template/repository/entities/phone-template.entity';
import { PushTemplate } from '../../resources/push-template/repository/entities/push-template.entity';
import { PushAction } from '../../resources/push-template/repository/entities/push-action.entity';
import { NotificationLog } from '../../resources/notification-log/repository/entities/notification-log.entity';
import { NotificationAttempt } from '../../resources/notification-log/repository/entities/notification-attempt.entity';

@Injectable()
export class OrmDataSourceService implements OnApplicationShutdown {
  private _dataSource: DataSource;

  constructor(private readonly configService: ConfigService) {}

  get dataSource(): DataSource {
    return this._dataSource;
  }

  async initialize(_tenantId?: string) {
    let dataSourceOptsFactory: (
      configService: ConfigService,
    ) => DataSourceOptions = postgresDatabaseFactory;

    if (this.configService.get('DB_DRIVER') === 'mariadb') {
      dataSourceOptsFactory = mariaDabaseFactory;
    }

    this._dataSource = new DataSource({
      ...dataSourceOptsFactory(this.configService),
      // TODO: Investigate how to autoload entities (if possible) since webpack compiles to a
      // main.js file instead of *.entity.{ts|js}.
      entities: [
        EmailTemplate,
        PhoneTemplate,
        PushTemplate,
        PushAction,
        NotificationLog,
        NotificationAttempt,
      ],
    });

    return await this._dataSource.initialize();
  }

  getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
  ): Repository<Entity> {
    return this._dataSource.getRepository(target);
  }

  async onApplicationShutdown(_signal?: string) {
    if (this._dataSource && this._dataSource.isInitialized) {
      await this._dataSource.destroy();
    }
  }
}
