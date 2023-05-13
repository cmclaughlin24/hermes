import { Module } from '@nestjs/common';
import { PhoneTemplateService } from './phone-template.service';
import { PhoneTemplateController } from './phone-template.controller';

@Module({
  controllers: [PhoneTemplateController],
  providers: [PhoneTemplateService]
})
export class PhoneTemplateModule {}
