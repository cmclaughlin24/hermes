import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export function postgresDatabaseFactory(
  configService: ConfigService,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    synchronize: configService.get('DB_SYNC'),
    ssl: configService.get('DB_SSL'),
  };
}

export function mariaDabaseFactory(
  configService: ConfigService,
): DataSourceOptions {
  return {
    type: 'mariadb',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    synchronize: configService.get('DB_SYNC'),
    ssl: configService.get('DB_SSL'),
  };
}
