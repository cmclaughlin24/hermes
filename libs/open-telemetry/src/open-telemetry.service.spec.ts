import { Test, TestingModule } from '@nestjs/testing';
import { OpenTelemetryService } from './open-telemetry.service';

describe('OpenTelemetryService', () => {
  let service: OpenTelemetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenTelemetryService],
    }).compile();

    service = module.get<OpenTelemetryService>(OpenTelemetryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
