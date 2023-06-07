import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PushAction } from './entities/push-action.entity';
import { PushTemplate } from './entities/push-template.entity';
import { PushTemplateController } from './push-template.controller';
import { PushTemplateService } from './push-template.service';

@Module({
  imports: [SequelizeModule.forFeature([PushTemplate, PushAction])],
  controllers: [PushTemplateController],
  providers: [PushTemplateService],
  exports: [PushTemplateService],
})
export class PushTemplateModule {}
