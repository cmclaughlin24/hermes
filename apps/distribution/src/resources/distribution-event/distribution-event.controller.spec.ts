import { Test, TestingModule } from '@nestjs/testing';
import {
  MockDistributionEventService,
  createDistributionEventServiceMock,
} from '../../../test/helpers/provider.helper';
import { DistributionEventController } from './distribution-event.controller';
import { DistributionEventService } from './distribution-event.service';

describe('DistributionEventController', () => {
  let controller: DistributionEventController;
  let service: MockDistributionEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionEventController],
      providers: [
        {
          provide: DistributionEventService,
          useValue: createDistributionEventServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<DistributionEventController>(
      DistributionEventController,
    );
    service = module.get<MockDistributionEventService>(
      DistributionEventService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should yield a list of distribution events', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('findOne()', () => {
    it('should yield a distribution event', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      // Act/Assert.
    });
  });
});
