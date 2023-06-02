import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PushTemplate } from './entities/push-template.entity';
import { PushTemplateController } from './push-template.controller';
import { PushTemplateService } from './push-template.service';

@Module({
  imports: [SequelizeModule.forFeature([PushTemplate])],
  controllers: [PushTemplateController],
  providers: [PushTemplateService]
})
export class PushTemplateModule {}
