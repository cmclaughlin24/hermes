import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  createMockRepository,
} from '../../../../test/helpers/database.helper';
import { DistributionRule } from '../../distribution-rule/repository/entities/distribution-rule.entity';
import { CreateDistributionEventDto } from '../dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from '../dto/update-distribution-event.dto';
import { OrmDistributionEventRepository } from './orm-distribution-event.repository';
import { DistributionEvent } from './entities/distribution-event.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('OrmDistributionEventRepository', () => {
  let repository: OrmDistributionEventRepository;
  let distributionEventModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrmDistributionEventRepository,
        {
          provide: getRepositoryToken(DistributionEvent),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(DistributionRule),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    repository = module.get<OrmDistributionEventRepository>(
      OrmDistributionEventRepository,
    );
    distributionEventModel = module.get<MockRepository>(
      getRepositoryToken(DistributionEvent),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    const distributionEvent = {
      eventType: 'unit-test',
    } as DistributionEvent;

    afterEach(() => {
      distributionEventModel.find.mockClear();
    });

    it('should yield a list of distribution events (w/o rules & subscriptions)', async () => {
      // Arrange.
      const expectedResult = [distributionEvent];
      distributionEventModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll(false, false)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a list of distribution events (w/rules)', async () => {
      // Arrange.
      const expectedResult = {
        relations: { rules: true, subscriptions: false },
      };
      distributionEventModel.find.mockResolvedValue([distributionEvent]);

      // Act
      await repository.findAll(true, false);

      // Assert.
      expect(distributionEventModel.find).toHaveBeenCalledWith(expectedResult);
    });

    it('should yield a list of distribution events (w/subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        relations: { rules: false, subscriptions: true },
      };
      distributionEventModel.find.mockResolvedValue([distributionEvent]);

      // Act
      await repository.findAll(false, true);

      // Assert.
      expect(distributionEventModel.find).toHaveBeenCalledWith(expectedResult);
    });

    it('should yield a list of distribution events (w/rules & subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        relations: { rules: true, subscriptions: true },
      };
      distributionEventModel.find.mockResolvedValue([distributionEvent]);

      // Act
      await repository.findAll(true, true);

      // Assert.
      expect(distributionEventModel.find).toHaveBeenCalledWith(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      distributionEventModel.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll(false, false)).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    const distributionEvent = {
      eventType: 'unit-test',
    } as DistributionEvent;

    afterEach(() => {
      distributionEventModel.findOne.mockClear();
    });

    it('should yield a distribution event (w/o rules & subscriptions)', async () => {
      // Arrange.
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        repository.findOne(distributionEvent.eventType),
      ).resolves.toEqual(distributionEvent);
    });

    it('should yield a distribution event (w/rules)', async () => {
      // Arrange.
      const expectedResult = {
        where: { eventType: distributionEvent.eventType },
        relations: { rules: true, subscriptions: false },
      };
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await repository.findOne(distributionEvent.eventType, true);

      // Assert.
      expect(distributionEventModel.findOne).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield a distribution event (w/subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        where: { eventType: distributionEvent.eventType },
        relations: { rules: false, subscriptions: true },
      };
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await repository.findOne(distributionEvent.eventType, false, true);

      // Assert.
      expect(distributionEventModel.findOne).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield a distribution event (w/rules & subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        where: { eventType: distributionEvent.eventType },
        relations: { rules: true, subscriptions: true },
      };
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await repository.findOne(distributionEvent.eventType, true, true);

      // Assert.
      expect(distributionEventModel.findOne).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      distributionEventModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      expect(
        repository.findOne(distributionEvent.eventType),
      ).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    const distributionEvent = {
      eventType: 'unit-test',
    };

    afterEach(() => {
      distributionEventModel.create.mockClear();
      distributionEventModel.save.mockClear();
    });

    it('should create a distribution event', async () => {
      // Arrange.
      distributionEventModel.create.mockReturnValue(distributionEvent);
      distributionEventModel.save.mockResolvedValue(distributionEvent);

      // Act.
      await repository.create({
        rules: [{ metadata: null }],
      } as CreateDistributionEventDto);

      // Assert.
      expect(distributionEventModel.create).toHaveBeenCalled();
    });

    it('should yield the created distribution event', async () => {
      // Arrange.
      distributionEventModel.create.mockReturnValue(distributionEvent);
      distributionEventModel.save.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        repository.create({
          rules: [{ metadata: null }],
        } as CreateDistributionEventDto),
      ).resolves.toEqual(distributionEvent);
    });

    it('should throw an "ExistsException" if a distribution event already exists', async () => {
      // Arrange.
      const createDistributionEventDto = {
        eventType: 'unit-test',
      } as CreateDistributionEventDto;
      const expectedResult = new ExistsException(
        `Distribution Event for eventType=${createDistributionEventDto.eventType} already exists!`,
      );
      distributionEventModel.save.mockRejectedValue({
        code: PostgresError.UNIQUE_VIOLATION,
      });

      // Act/Assert.
      await expect(
        repository.create(createDistributionEventDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    const distributionEvent = {};
    const eventType = 'unit-test';

    afterEach(() => {
      distributionEventModel.findOneBy.mockClear();
      distributionEventModel.save.mockClear();
    });

    it('should update a distribution event', async () => {
      // Arrange.
      distributionEventModel.findOneBy.mockResolvedValue(distributionEvent);

      // Act.
      await repository.update(eventType, {} as UpdateDistributionEventDto);

      // Assert.
      expect(distributionEventModel.save).toHaveBeenCalled();
    });

    it('should yield the updated distribution event', async () => {
      // Arrange.
      distributionEventModel.findOneBy.mockResolvedValue(distributionEvent);
      distributionEventModel.save.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        repository.update(eventType, {} as UpdateDistributionEventDto),
      ).resolves.toEqual(distributionEvent);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
      distributionEventModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.update(eventType, {} as UpdateDistributionEventDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const distributionEvent = {};
    const eventType = 'unit-test';

    afterEach(() => {
      distributionEventModel.remove.mockClear();
    });

    it('should remove a distribution event', async () => {
      // Arrange.
      distributionEventModel.findOneBy.mockResolvedValue(distributionEvent);

      // Act.
      await repository.remove(eventType);

      // Assert.
      expect(distributionEventModel.remove).toHaveBeenCalled();
    });

    it('should yield a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
      distributionEventModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.remove(eventType)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
