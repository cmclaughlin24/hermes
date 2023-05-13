import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PhoneTemplate } from './entities/phone-template.entity';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';

@Module({
  imports: [SequelizeModule.forFeature([PhoneTemplate])],
  controllers: [PhoneTemplateController],
  providers: [PhoneTemplateService],
  exports: [PhoneTemplateService],
})
export class PhoneTemplateModule {}
