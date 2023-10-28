import { Test, TestingModule } from '@nestjs/testing';
import { IamClientService } from './iam-client.service';

describe('IamClientService', () => {
  let service: IamClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IamClientService],
    }).compile();

    service = module.get<IamClientService>(IamClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
