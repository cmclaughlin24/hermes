import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { In } from 'typeorm';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import {
  MockTokenStorage,
  createPermissionServiceMock,
  createTokenStorage,
} from '../../../test/helpers/provider.helper';
import { HashingService } from '../../common/services/hashing.service';
import { TokenStorage } from '../../common/storage/token.storage';
import { PermissionService } from '../permission/permission.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { DeliveryWindow } from './entities/delivery-window.entity';
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
  let tokenStorage: MockTokenStorage;

  const user: User = {
    id: randomUUID(),
    name: 'Amy the Hedgehog',
    email: 'amy.hedgehog@sega.com',
    phoneNumber: '+18888888888',
    password: 'sonic-the-hedgehog',
    timeZone: 'Etc/UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
        {
          provide: getRepositoryToken(DeliveryWindow),
          useValue: createMockRepository<DeliveryWindow>(),
        },
        {
          provide: HashingService,
          useValue: createHashingServiceMock(),
        },
        {
          provide: TokenStorage,
          useValue: createTokenStorage(),
        },
        {
          provide: PermissionService,
          useValue: createPermissionServiceMock(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<MockRepository>(getRepositoryToken(User));
    hashingService = module.get<MockHashingService>(HashingService);
    tokenStorage = module.get<MockTokenStorage>(TokenStorage);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      repository.find.mockClear();
    });

    it('should yield a list of user', async () => {
      // Arrange.
      const expectedResult = [user];
      repository.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll(null)).resolves.toEqual(expectedResult);
    });

    it('should yield a list of users filtered by id', async () => {
      // Arrange.
      const ids = [randomUUID()];
      const expectedResult = {
        where: {
          id: In(ids),
        },
      };
      repository.find.mockResolvedValue([]);

      // Act.
      await service.findAll(ids);

      // Assert.
      expect(repository.find).toHaveBeenCalledWith(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      repository.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(null)).resolves.toEqual([]);
    });
  });

  describe('findById()', () => {
    afterEach(() => {
      repository.findOneBy.mockClear();
    });

    it('should yield a user', async () => {
      // Arrange.
      repository.findOneBy.mockResolvedValue(user);

      // Act/Assert.
      await expect(service.findById(user.id)).resolves.toEqual(user);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      repository.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findById(user.id)).resolves.toBeNull();
    });
  });

  describe('findByEmail()', () => {
    afterEach(() => {
      repository.findOne.mockClear();
    });

    it('should yield a user', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(user);

      // Act/Assert.
      await expect(service.findByEmail(user.email)).resolves.toEqual(user);
    });

    it("should include the user's permissions if requested", async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(user);

      // Act.
      await service.findByEmail(user.email, true);

      // Assert.
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
        relations: ['permissions'],
      });
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findByEmail(user.email)).resolves.toBeNull();
    });
  });

  describe('findDeliveryWindows()', () => {
    it.todo('should yield a list of users with their delivery windows');

    it.todo(
      'should yield an empty list if the repository returns an empty list',
    );
  });

  describe('findPermissions()', () => {
    it.todo('should yield a list of users with their permissions');

    it.todo(
      'should yield an empty list if the repository returns an empty list',
    );
  });

  describe('create()', () => {
    const createUserInput: CreateUserInput = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: user.password,
    };

    beforeEach(() => {
      hashingService.hash.mockResolvedValue(null);
    });

    afterEach(() => {
      repository.create.mockClear();
      repository.save.mockClear();
      hashingService.hash.mockClear();
    });

    it('should create a user', async () => {
      // Arrange.
      repository.save.mockResolvedValue(null);

      // Act.
      await service.create(createUserInput);

      // Assert.
      expect(repository.create).toHaveBeenCalled();
    });

    it("should hash the user's password", async () => {
      // Arrange.
      repository.save.mockResolvedValue(null);

      // Act.
      await service.create(createUserInput);

      // Assert.
      expect(hashingService.hash).toHaveBeenCalled();
    });

    it.todo('should assign permission(s) to the user');

    it.todo('should create delivery window(s) for the user');

    it('should yield the created user', async () => {
      // Arrange.
      repository.save.mockResolvedValue(user);

      // Act/Assert.
      await expect(service.create(createUserInput)).resolves.toEqual(user);
    });

    it('should throw an "ExistsException" if the email or phone number is already in use', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `User with email=${createUserInput.email} or phoneNumber=${createUserInput.phoneNumber} already exists!`,
      );
      repository.save.mockRejectedValue({
        code: PostgresError.UNIQUE_VIOLATION,
      });

      // Act/Assert.
      await expect(service.create(createUserInput)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const updateUserInput: UpdateUserInput = {
      email: 'blaze.cat@sega.com',
    };

    afterEach(() => {
      repository.preload.mockClear();
      repository.save.mockClear();
      tokenStorage.remove.mockClear();
    });

    it('should update a user', async () => {
      // Arrange.
      repository.preload.mockResolvedValue({});
      repository.save.mockResolvedValue(user);

      // Act.
      await service.update(user.id, updateUserInput);

      // Assert.
      expect(repository.preload).toHaveBeenCalled();
    });

    it.todo('should update the assigned permission(s) of the user');

    it.todo('should update the delivery window(s) for the user');

    it("should invalidate the user's access token (if issued)", async () => {
      // Arrange.
      repository.preload.mockResolvedValue({});
      repository.save.mockResolvedValue(user);

      // Act.
      await service.update(user.id, updateUserInput);

      // Assert.
      expect(tokenStorage.remove).toHaveBeenCalledWith(user.id);
    });

    it('should yield the updated user', async () => {
      // Arrange.
      const expectedResult = { ...user, ...updateUserInput };
      repository.preload.mockResolvedValue(expectedResult);
      repository.save.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.update(user.id, updateUserInput)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `User userId=${user.id} not found!`,
      );
      repository.preload.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.update(user.id, updateUserInput)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('remove()', () => {
    beforeEach(() => {
      repository.remove.mockResolvedValue(user);
    });

    afterEach(() => {
      repository.findOneBy.mockClear();
      repository.remove.mockClear();
      tokenStorage.remove.mockClear();
    });

    it('should remove a user', async () => {
      // Arrange.
      repository.findOneBy.mockResolvedValue(user);

      // Act.
      await service.remove(user.id);

      // Assert.
      expect(repository.remove).toHaveBeenCalledWith(user);
    });

    it("should invalidate the user's access token (if issued)", async () => {
      // Arrange.
      repository.findOneBy.mockResolvedValue(user);

      // Act.
      await service.remove(user.id);

      // Assert.
      expect(tokenStorage.remove).toHaveBeenCalledWith(user.id);
    });

    it('should yield the removed user', async () => {
      // Arrange.
      repository.findOneBy.mockResolvedValue(user);

      // Act/Assert.
      await expect(service.remove(user.id)).resolves.toEqual(user);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `User userId=${user.id} not found!`,
      );
      repository.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(user.id)).rejects.toEqual(expectedResult);
    });
  });
});
