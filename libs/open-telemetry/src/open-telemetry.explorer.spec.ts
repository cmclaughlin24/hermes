import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { OpenTelemetryExplorer } from './open-telemetry.explorer';
import { OPEN_TELEMETRY_OPTIONS_TOKEN } from './open-telemetry.module-definition';

type MockDiscoveryService = Partial<Record<keyof DiscoveryService, jest.Mock>>;

const createDiscoveryServiceMock = (): MockDiscoveryService => ({
  getControllers: jest.fn(),
  getProviders: jest.fn(),
});

type MockReflector = Partial<Record<keyof Reflector, jest.Mock>>;

const createReflectorMock = (): MockReflector => ({
  get: jest.fn(),
});

type MockMetadataScanner = Partial<Record<keyof MetadataScanner, jest.Mock>>;

const createMetadataScanner = (): MockMetadataScanner => ({
  getAllMethodNames: jest.fn(),
});

describe('OpenTelemetryExplorer', () => {
  let service: OpenTelemetryExplorer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenTelemetryExplorer,
        {
          provide: OPEN_TELEMETRY_OPTIONS_TOKEN,
          useValue: {},
        },
        {
          provide: DiscoveryService,
          useValue: createDiscoveryServiceMock(),
        },
        {
          provide: Reflector,
          useValue: createReflectorMock(),
        },
        {
          provide: MetadataScanner,
          useValue: createMetadataScanner(),
        },
      ],
    }).compile();

    service = module.get<OpenTelemetryExplorer>(OpenTelemetryExplorer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('explore()', () => {
    it.todo('should configure the providers to emit telemetry data');

    it.todo('should configure the controllers to emit telemetry data');

    it.todo('should exit if OpenTelemetry is disabled');
  });
});
