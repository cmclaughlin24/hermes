import { Module } from '@nestjs/common';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';

@Module({
  controllers: [PhoneTemplateController],
  providers: [PhoneTemplateService],
  exports: [PhoneTemplateService],
})
export class PhoneTemplateModule {}
