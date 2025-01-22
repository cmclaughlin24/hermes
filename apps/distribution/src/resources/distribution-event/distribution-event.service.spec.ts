import { ExistsException, MissingException } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';
import { DistributionRule } from '../distribution-rule/repository/entities/distribution-rule.entity';
import { SubscriptionFilter } from '../subscription/repository/entities/subscription-filter.entity';
import { Subscription } from '../subscription/repository/entities/subscription.entity';
import { DistributionEventService } from './distribution-event.service';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './repository/entities/distribution-event.entity';
import { DistributionEventRepository } from './repository/distribution-event.repository';

type MockDistributionEventRepository = Partial<
  Record<keyof DistributionEventRepository, jest.Mock>
>;

const createDistributionEventRepositoryMock =
  (): MockDistributionEventRepository => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  });

describe('DistributionEventService', () => {
  let service: DistributionEventService;
  let repository: MockDistributionEventRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionEventService,
        {
          provide: DistributionEventRepository,
          useValue: createDistributionEventRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<DistributionEventService>(DistributionEventService);
    repository = module.get<MockDistributionEventRepository>(
      DistributionEventRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const distributionEvent = {
      eventType: 'unit-test',
    } as DistributionEvent;

    afterEach(() => {
      repository.findAll.mockClear();
    });

    it('should yield a list of distribution events (w/o rules & subscriptions)', async () => {
      // Arrange.
      const expectedResult = [distributionEvent];
      repository.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll(false, false)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a list of distribution events (w/rules)', async () => {
      // Arrange.
      repository.findAll.mockResolvedValue([distributionEvent]);

      // Act
      await service.findAll(true, false);

      // Assert.
      expect(repository.findAll).toHaveBeenCalledWith(true, false,);
    });

    it('should yield a list of distribution events (w/subscriptions)', async () => {
      // Arrange.
      repository.findAll.mockResolvedValue([distributionEvent]);

      // Act
      await service.findAll(false, true);

      // Assert.
      expect(repository.findAll).toHaveBeenCalledWith(false, true);
    });

    it('should yield a list of distribution events (w/rules & subscriptions)', async () => {
      // Arrange.
      repository.findAll.mockResolvedValue([distributionEvent]);

      // Act
      await service.findAll(true, true);

      // Assert.
      expect(repository.findAll).toHaveBeenCalledWith(true, true);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      repository.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(false, false)).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    const distributionEvent = {
      eventType: 'unit-test',
    } as DistributionEvent;

    afterEach(() => {
      repository.findOne.mockClear();
    });

    it('should yield a distribution event (w/o rules & subscriptions)', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        service.findOne(distributionEvent.eventType),
      ).resolves.toEqual(distributionEvent);
    });

    it('should yield a distribution event (w/rules)', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await service.findOne(distributionEvent.eventType, true);

      // Assert.
      expect(repository.findOne).toHaveBeenCalledWith(
        distributionEvent.eventType,
        true,
        false,
      );
    });

    it('should yield a distribution event (w/subscriptions)', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await service.findOne(distributionEvent.eventType, false, true);

      // Assert.
      expect(repository.findOne).toHaveBeenCalledWith(
        distributionEvent.eventType,
        false,
        true,
      );
    });

    it('should yield a distribution event (w/rules & subscriptions)', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await service.findOne(distributionEvent.eventType, true, true);

      // Assert.
      expect(repository.findOne).toHaveBeenCalledWith(
        distributionEvent.eventType,
        true,
        true,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(null);

      // Act/Assert.
      expect(service.findOne(distributionEvent.eventType)).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    const distributionEvent = {
      eventType: 'unit-test',
    };

    afterEach(() => {
      repository.create.mockClear();
    });

    it('should create a distribution event', async () => {
      // Arrange.
      repository.create.mockResolvedValue(distributionEvent);

      // Act.
      await service.create({
        rules: [{ metadata: null }],
      } as CreateDistributionEventDto);

      // Assert.
      expect(repository.create).toHaveBeenCalled();
    });

    it('should yield the created distribution event', async () => {
      // Arrange.
      repository.create.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        service.create({
          rules: [{ metadata: null }],
        } as CreateDistributionEventDto),
      ).resolves.toEqual(distributionEvent);
    });

    it('should throw an "ExistsException" if a distribution event already exists', async () => {
      // Arrange.
      const createDistributionEventDto = {
        eventType: 'unit-test',
        rules: [{ metadata: null }],
      } as CreateDistributionEventDto;
      const expectedResult = new ExistsException(
        `Distribution Event for eventType=${createDistributionEventDto.eventType} already exists!`,
      );
      repository.create.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.create(createDistributionEventDto)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "DefaultRuleException" if a default distribution rule is not defined (w/rules equal to empty list)', async () => {
      // Arrange.
      const createDistributionEventDto = {
        eventType: 'unit-test',
        rules: [],
      } as CreateDistributionEventDto;
      const expectedResult = new DefaultRuleException(
        `Distribution Event for eventType=${createDistributionEventDto.eventType} must have a default distribution rule (metadata=null)`,
      );

      // Act/Assert.
      await expect(service.create(createDistributionEventDto)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "DefaultRuleException" if a default distribution rule is not defined (w/rules equal to null)', async () => {
      // Arrange.
      const createDistributionEventDto = {
        eventType: 'unit-test',
        rules: null,
      } as CreateDistributionEventDto;
      const expectedResult = new DefaultRuleException(
        `Distribution Event for eventType=${createDistributionEventDto.eventType} must have a default distribution rule (metadata=null)`,
      );

      // Act/Assert.
      await expect(service.create(createDistributionEventDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const distributionEvent = { eventType: '' };
    const eventType = 'unit-test';

    afterEach(() => {
      repository.update.mockClear();
    });

    it('should update a distribution event', async () => {
      // Arrange.
      repository.update.mockResolvedValue(distributionEvent);

      // Act.
      await service.update(eventType, {} as UpdateDistributionEventDto);

      // Assert.
      expect(repository.update).toHaveBeenCalled();
    });

    it('should yield the updated distribution event', async () => {
      // Arrange.
      repository.update.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        service.update(eventType, {} as UpdateDistributionEventDto),
      ).resolves.toEqual(distributionEvent);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
      repository.update.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.update(eventType, {} as UpdateDistributionEventDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const distributionEvent = { eventType: '' };
    const eventType = 'unit-test';

    afterEach(() => {
      repository.remove.mockClear();
    });

    it('should remove a distribution event', async () => {
      // Arrange.
      repository.remove.mockResolvedValue(distributionEvent);

      // Act.
      await service.remove(eventType);

      // Assert.
      expect(repository.remove).toHaveBeenCalled();
    });

    it('should yield a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
      repository.remove.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.remove(eventType)).rejects.toEqual(expectedResult);
    });
  });
});
