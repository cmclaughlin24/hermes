import { Test, TestingModule } from '@nestjs/testing';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';

describe('PhoneTemplateController', () => {
  let controller: PhoneTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhoneTemplateController],
      providers: [PhoneTemplateService],
    }).compile();

    controller = module.get<PhoneTemplateController>(PhoneTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
