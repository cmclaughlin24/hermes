import { Test, TestingModule } from '@nestjs/testing';
import { OpenTelemetryExplorer } from './open-telemetry.explorer';

describe('OpenTelemetryExplorer', () => {
  let service: OpenTelemetryExplorer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenTelemetryExplorer],
    }).compile();

    service = module.get<OpenTelemetryExplorer>(OpenTelemetryExplorer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
