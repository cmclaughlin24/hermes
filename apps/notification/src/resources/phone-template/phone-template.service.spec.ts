import { Test, TestingModule } from '@nestjs/testing';
import { PhoneTemplateService } from './phone-template.service';

describe('PhoneTemplateService', () => {
  let service: PhoneTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneTemplateService],
    }).compile();

    service = module.get<PhoneTemplateService>(PhoneTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
