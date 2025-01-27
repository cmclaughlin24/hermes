import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  CORE_MODULE_OPTIONS,
  CORE_MODULE_OPTIONS_TYPE,
} from '../core.module-definition';
import { ConfigService } from '@nestjs/config';
import {
  DataSource,
  DataSourceOptions,
  Repository,
  EntityTarget,
  ObjectLiteral,
} from 'typeorm';
import {
  mariaDabaseFactory,
  postgresDatabaseFactory,
} from '../../config/database.config';
import { ApiKey } from '../../resources/api-key/entities/api-key.entity';
import { User } from '../../resources/user/repository/entities/user.entity';
import { Permission } from '../../resources/permission/repository/entities/permission.entity';
import { DeliveryWindow } from '../../resources/user/repository/entities/delivery-window.entity';

@Injectable()
export class OrmDataSourceService implements OnApplicationShutdown {
  private _dataSource: DataSource;

  constructor(
    @Inject(CORE_MODULE_OPTIONS)
    private readonly options: typeof CORE_MODULE_OPTIONS_TYPE,
    private readonly configService: ConfigService,
  ) {}

  async initialize() {
    let dataSourceOptsFactory: (
      configService: ConfigService,
    ) => DataSourceOptions = postgresDatabaseFactory;

    if (this.options.driver === 'mariadb') {
      dataSourceOptsFactory = mariaDabaseFactory;
    }

    const dataSource = new DataSource({
      ...dataSourceOptsFactory(this.configService),
      // TODO: Investigate how to autoload entities (if possible) since webpack compiles to a
      // main.js file instead of *.entity.{ts|js}.
      entities: [ApiKey, DeliveryWindow, Permission, User],
    });

    return await dataSource.initialize();
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
