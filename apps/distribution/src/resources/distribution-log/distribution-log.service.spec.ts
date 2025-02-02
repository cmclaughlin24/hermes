import { Test, TestingModule } from '@nestjs/testing';
import { DistributionJob } from '../../common/types/distribution-job.type';
import { MessageState } from '../../common/types/message-state.type';
import { DistributionLogService } from './distribution-log.service';
import { DistributionLog } from './repository/entities/distribution-log.entity';
import { DistributionLogRepository } from './repository/distribution-log.repository';

type MockDistributionLogRepository = Partial<
  Record<keyof DistributionLogRepository, jest.Mock>
>;

const createDistributionLogRepositoryMock =
  (): MockDistributionLogRepository => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  });

describe('DistributionLogService', () => {
  let service: DistributionLogService;
  let repository: MockDistributionLogRepository;

  const log = {
    id: '32641f47-785e-4f43-8249-fff97e5009d0',
    state: MessageState.COMPLETED,
    attempts: 2,
  } as DistributionLog;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionLogService,
        {
          provide: DistributionLogRepository,
          useValue: createDistributionLogRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<DistributionLogService>(DistributionLogService);
    repository = module.get<MockDistributionLogRepository>(
      DistributionLogRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      repository.findAll.mockClear();
    });

    it('should yield a list of distribution logs', async () => {
      // Arrange.
      const expectedResult: DistributionLog[] = [log];
      repository.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll(null, null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a list of distribution logs filtered by eventType(s)', async () => {
      // Arrange.
      const eventTypes = ['unit-test'];
      repository.findAll.mockResolvedValue([log]);

      // Act.
      await service.findAll(eventTypes, null);

      //Assert.
      expect(repository.findAll).toHaveBeenCalledWith(eventTypes, null);
    });

    it('should yield a list of distribution logs filtered by state(s)', async () => {
      // Arrange.
      const states = ['unit-test'];
      repository.findAll.mockResolvedValue([log]);

      // Act.
      await service.findAll(null, states);

      //Assert.
      expect(repository.findAll).toHaveBeenCalledWith(null, states);
    });

    it('should throw an empty list if the repository returns an empty list', async () => {
      // Arrange.
      repository.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(null, null)).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      repository.findOne.mockClear();
    });

    it('should yield a distribution log', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(log);

      // Act/Assert.
      await expect(service.findOne('')).resolves.toEqual(log);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const id = '32641f47-785e-4f43-8249-fff97e5009d0';
      repository.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(id)).resolves.toBeNull();
    });
  });

  describe('log()', () => {
    const job: DistributionJob = {
      id: 'unit-test',
      type: 'unit-test',
      attemptsMade: 0,
      metadata: null,
      payload: null,
      addedAt: new Date(),
      processedAt: new Date(),
      finishedAt: new Date(),
    };
    const log = { eventType: job.type, state: MessageState.ACTIVE };

    afterEach(() => {
      repository.findOne.mockClear();
      repository.create.mockClear();
      repository.update.mockClear();
    });

    it('should create a distribution log if the repository returns null/undefined', async () => {
      // Act.
      await service.log(job, MessageState.ACTIVE);

      // Assert.
      expect(repository.create).toHaveBeenCalledWith(
        job,
        MessageState.ACTIVE,
        undefined,
        null,
      );
    });

    it('should update a distribution log if the repository returns a result', async () => {
      // Arrange.
      const log = {};
      repository.findOne.mockResolvedValue(log);

      // Act.
      await service.log(job, MessageState.ACTIVE);

      // Assert.
      expect(repository.update).toHaveBeenCalledWith(
        job,
        MessageState.ACTIVE,
        undefined,
        null,
      );
    });

    it('should yield the distribution log (create)', async () => {
      // Arrange.
      repository.create.mockResolvedValue(log);

      // Act/Assert.
      await expect(service.log(job, MessageState.ACTIVE)).resolves.toEqual(log);
    });

    it('should yield the distribution log (update)', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(log);
      repository.update.mockResolvedValue(log);

      // Act/Assert.
      await expect(service.log(job, MessageState.ACTIVE)).resolves.toEqual(log);
    });
  });
});
