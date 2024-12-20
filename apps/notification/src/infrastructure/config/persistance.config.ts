import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export async function persistanceFactory(
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> {
  const driver = configService.get('DB_DRIVER');

  switch (driver) {
    case 'postgres':
      return postgresFactory(configService);
    default:
      throw Error(
        `Unknown Persistance Driver: ${driver} cannot be used with the Notification Service`,
      );
  }
}

export async function postgresFactory(
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> {
  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    autoLoadEntities: true,
    synchronize: configService.get('DB_SYNC'),
    ssl: configService.get('DB_SSL'),
  };
}
