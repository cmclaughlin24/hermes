import {
  ApiResponseDto,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockDistributionEventService,
  createDistributionEventServiceMock,
} from '../../../test/helpers/provider.helper';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';
import { DistributionEventController } from './distribution-event.controller';
import { DistributionEventService } from './distribution-event.service';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './entities/distribution-event.entity';

describe('DistributionEventController', () => {
  let controller: DistributionEventController;
  let service: MockDistributionEventService;

  const distributionEvent = {
    eventType: 'unit-test',
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
    afterEach(() => {
      service.findAll.mockClear();
    });

    it('should yield a list of distribution events', async () => {
      // Arrange.
      const expectedResult: DistributionEvent[] = [distributionEvent];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll(false, false)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution events not found!`,
      );
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findAll(false, false)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the service returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution events not found!`,
      );
      service.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(controller.findAll(false, false)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      service.findOne.mockClear();
    });

    it('should yield a distribution event', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        controller.findOne(distributionEvent.eventType, false, false),
      ).resolves.toEqual(distributionEvent);
    });

    it('should throw a "NotFoundException" if the service return null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution Event for eventType=${distributionEvent.eventType} not found!`,
      );
      service.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        controller.findOne(distributionEvent.eventType, false, false),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    afterEach(() => {
      service.create.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionEvent>(
        `Successfully created distribution rule for eventType=${distributionEvent.eventType}!`,
        distributionEvent,
      );
      service.create.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        controller.create({} as CreateDistributionEventDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "BadRequestExcepction" if an distribution event already exists', async () => {
      // Arrange.
      const errorMessage = `Distribution Event for eventType=${distributionEvent.eventType} already exists!`;
      const expectedResult = new BadRequestException(errorMessage);
      service.create.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(
        controller.create({
          eventType: distributionEvent.eventType,
        } as CreateDistributionEventDto),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw a "BadRequestExcepction" if a default distribution rule is not defined', async () => {
      // Arrange.
      const errorMessage = `Distribution Event for eventType=${distributionEvent.eventType} must have a default distribution rule (metadata=null)`;
      const expectedResult = new BadRequestException(errorMessage);
      service.create.mockRejectedValue(new DefaultRuleException(errorMessage));

      // Act/Assert.
      await expect(
        controller.create({
          eventType: distributionEvent.eventType,
        } as CreateDistributionEventDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    afterEach(() => {
      service.update.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionEvent>(
        `Successfully updated distribution event for eventType=${distributionEvent.eventType}!`,
        distributionEvent,
      );
      service.update.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        controller.update(
          distributionEvent.eventType,
          {} as UpdateDistributionEventDto,
        ),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if a distribution event does not exist', async () => {
      // Arrange.
      const errorMessage = `Successfully deleted distribution event for eventType=${distributionEvent.eventType}!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.update.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.update(
          distributionEvent.eventType,
          {} as UpdateDistributionEventDto,
        ),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    afterEach(() => {
      service.remove.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionEvent>(
        `Successfully deleted distribution event for eventType=${distributionEvent.eventType}!`,
      );
      service.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.remove(distributionEvent.eventType),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if a distribution event does not exist', async () => {
      // Arrange.
      const errorMessage = `Successfully deleted distribution event for eventType=${distributionEvent.eventType}!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.remove.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.remove(distributionEvent.eventType),
      ).rejects.toEqual(expectedResult);
    });
  });
});
