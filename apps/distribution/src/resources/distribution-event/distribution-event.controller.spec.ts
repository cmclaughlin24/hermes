import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto } from '@notification/common';
import {
  MockDistributionEventService,
  createDistributionEventServiceMock,
} from '../../../test/helpers/provider.helper';
import { DistributionEventController } from './distribution-event.controller';
import { DistributionEventService } from './distribution-event.service';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './entities/distribution-event.entity';

describe('DistributionEventController', () => {
  let controller: DistributionEventController;
  let service: MockDistributionEventService;

  const distributionEvent = {
    id: '8544f373-8442-4307-aaa0-f26d4f7b30b1',
    queue: 'unit-test',
    messageType: 'unit-test',
    metadataLabels: ['unit-test'],
  } as DistributionEvent;

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
      const expectedResult: DistributionEvent[] = [distributionEvent];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll(false, false)).resolves.toEqual(
        expectedResult,
      );
    });
  });

  describe('findOne()', () => {
    it('should yield a distribution event', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        controller.findOne(
          distributionEvent.queue,
          distributionEvent.messageType,
          false,
          false,
        ),
      ).resolves.toEqual(distributionEvent);
    });
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionEvent>(
        `Successfully created distribution event!`,
        distributionEvent,
      );
      service.create.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.create({} as CreateDistributionEventDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionEvent>(
        `Successfully updated distribution event!`,
        distributionEvent,
      );
      service.update.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.update(
          distributionEvent.queue,
          distributionEvent.messageType,
          {} as UpdateDistributionEventDto,
        ),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionEvent>(
        `Successfully deleted distribution event!`,
      );
      service.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.remove(
          distributionEvent.queue,
          distributionEvent.messageType,
        ),
      ).resolves.toEqual(expectedResult);
    });
  });
});
