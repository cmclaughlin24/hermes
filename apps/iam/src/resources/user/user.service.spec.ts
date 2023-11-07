import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import { HashingService } from '../../common/services/hashing.service';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

type MockHashingService = Partial<Record<keyof HashingService, jest.Mock>>;

const createHashingServiceMock = (): MockHashingService => ({
  hash: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let repository: MockRepository;
  let hashingService: MockHashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
        {
          provide: HashingService,
          useValue: createHashingServiceMock(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<MockRepository>(getRepositoryToken(User));
    hashingService = module.get<MockHashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      repository.find.mockClear();
    });

    it.todo('should yield a list of user');

    it.todo(
      'should yield an empty list if the repository returns an empty list',
    );
  });

  describe('findById()', () => {
    afterEach(() => {
      repository.findOneBy.mockClear();
    });

    it.todo('should yield a user');

    it.todo('should yield null if the repository returns null/undefined');
  });

  describe('findByEmail()', () => {
    afterEach(() => {
      repository.findOneBy.mockClear();
    });

    it.todo('should yield a user');

    it.todo('should yield null if the repository returns null/undefined');
  });

  describe('create()', () => {
    afterEach(() => {
      repository.create.mockClear();
      repository.save.mockClear();
    });

    it.todo('should create a user');

    it.todo('should yield the created user');

    it.todo("should hash the user's password");

    it.todo(
      'should throw an "ExistsException" if the email or phone number is already in use',
    );
  });

  describe('update()', () => {
    afterEach(() => {
      repository.update.mockClear();
      repository.save.mockClear();
    });

    it.todo('should update a user');

    it.todo('should yield the updated user');

    it.todo(
      'should throw a "MissingException" if the repository returns null/undefined',
    );
  });

  describe('remove()', () => {
    afterEach(() => {
      repository.remove.mockClear();
    });

    it.todo('should remove a user');

    it.todo('should yield the removed user');

    it.todo(
      'should throw a "MissingException" if the repository returns null/undefined',
    );
  });
});
