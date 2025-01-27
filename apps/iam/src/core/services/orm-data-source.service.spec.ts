import { Test, TestingModule } from '@nestjs/testing';
import { OrmDataSourceService } from './orm-data-source.service';

describe('OrmDataSourceService', () => {
  let service: OrmDataSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrmDataSourceService],
    }).compile();

    service = module.get<OrmDataSourceService>(OrmDataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
