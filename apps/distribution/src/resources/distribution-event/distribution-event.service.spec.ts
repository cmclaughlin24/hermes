import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { MockRepository } from 'apps/notification/test/helpers/database.helpers';
import { createMockRepository } from '../../../test/helpers/database.helpers';
import { DistributionEventService } from './distribution-event.service';
import { DistributionEvent } from './entities/distribution-event.entity';

describe('DistributionEventService', () => {
  let service: DistributionEventService;
  let distributionEventModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionEventService,
        {
          provide: getModelToken(DistributionEvent),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<DistributionEventService>(DistributionEventService);
    distributionEventModel = module.get<MockRepository>(
      getModelToken(DistributionEvent),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    afterEach(() => {
      distributionEventModel.findAll.mockClear();
    });

    it('should yield a list of distribution events (no rules/subscriptions)', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should yield a list of distribution events (w/rules)', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should yield a list of distribution events (w/subscriptions)', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should throw a "NotFoundException" if the repository returns an empty list', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      distributionEventModel.findOne.mockClear();
    });

    it('should yield a distribution event', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('create()', () => {
    afterEach(() => {
      distributionEventModel.create.mockClear();
    });

    it('should create a distribution event', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should yield an "ApiResponseDto" object with the create distribution event', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should throw a "BadRequestException" if a distribution event already exists', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('update()', () => {
    const distributionEvent = { update: jest.fn() };

    afterEach(() => {
      distributionEvent.update.mockClear();
    });

    it('should update a distribution event', async () => {
      // Arrange.
      // Act
      //Assert.
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('remove()', () => {
    const distributionEvent = { destroy: jest.fn() };

    afterEach(() => {
      distributionEvent.destroy.mockClear();
    });

    it('should remove a distribution event', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should yield an "ApiResposneDto" object', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should yield a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      // Act/Assert.
    });
  });
});
