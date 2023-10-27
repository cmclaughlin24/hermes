import { Test, TestingModule } from '@nestjs/testing';
import { IamAccessTokenService } from './iam-access-token.service';

describe('IamAccessTokenService', () => {
  let service: IamAccessTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IamAccessTokenService],
    }).compile();

    service = module.get<IamAccessTokenService>(IamAccessTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
