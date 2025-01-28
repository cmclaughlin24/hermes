import { Test, TestingModule } from '@nestjs/testing';
import { TenantTokenService } from './tenant-token.service';

describe('TenantTokenService', () => {
  let service: TenantTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantTokenService],
    }).compile();

    service = module.get<TenantTokenService>(TenantTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
