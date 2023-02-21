import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

export async function databaseFactory(
  configService: ConfigService,
): Promise<SequelizeModuleOptions> {
  return {
    dialect: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    autoLoadModels: true,
    synchronize: true,
    logging: false,
  };
}
