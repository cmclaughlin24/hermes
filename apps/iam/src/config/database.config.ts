import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export function postgresDatabaseFactory(
  schema: string,
): (configService: ConfigService) => DataSourceOptions {
  return (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    schema: schema,
    synchronize: configService.get('DB_SYNC'),
    ssl: configService.get('DB_SSL'),
  });
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
