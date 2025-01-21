import { ExistsException, MissingException } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { In } from 'typeorm';
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
import { User } from './repository/entities/user.entity';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';

type MockHashingService = Partial<Record<keyof HashingService, jest.Mock>>;

const createHashingServiceMock = (): MockHashingService => ({
  hash: jest.fn(),
});

type MockUserRepository = Partial<Record<keyof UserRepository, jest.Mock>>;

const createUserRepositoryMock = (): MockUserRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findDeliveryWindows: jest.fn(),
  findPermissions: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let repository: MockUserRepository;
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
          provide: UserRepository,
          useValue: createUserRepositoryMock(),
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
    repository = module.get<MockUserRepository>(UserRepository);
    hashingService = module.get<MockHashingService>(HashingService);
    tokenStorage = module.get<MockTokenStorage>(TokenStorage);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      repository.findAll.mockClear();
    });

    it('should yield a list of user', async () => {
      // Arrange.
      const expectedResult = [user];
      repository.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll(null)).resolves.toEqual(expectedResult);
    });

    it('should yield a list of users filtered by id', async () => {
      // Arrange.
      const ids = [randomUUID()];
      repository.findAll.mockResolvedValue([]);

      // Act.
      await service.findAll(ids);

      // Assert.
      expect(repository.findAll).toHaveBeenCalledWith(ids);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      repository.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(null)).resolves.toEqual([]);
    });
  });

  describe('findById()', () => {
    afterEach(() => {
      repository.findById.mockClear();
    });

    it('should yield a user', async () => {
      // Arrange.
      repository.findById.mockResolvedValue(user);

      // Act/Assert.
      await expect(service.findById(user.id)).resolves.toEqual(user);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      repository.findById.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findById(user.id)).resolves.toBeNull();
    });
  });

  describe('findByEmail()', () => {
    afterEach(() => {
      repository.findByEmail.mockClear();
    });

    it('should yield a user', async () => {
      // Arrange.
      repository.findByEmail.mockResolvedValue(user);

      // Act/Assert.
      await expect(service.findByEmail(user.email)).resolves.toEqual(user);
    });

    it("should include the user's permissions if requested", async () => {
      // Arrange.
      repository.findByEmail.mockResolvedValue(user);

      // Act.
      await service.findByEmail(user.email, true);

      // Assert.
      expect(repository.findByEmail).toHaveBeenCalledWith(user.email, true);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      repository.findByEmail.mockResolvedValue(null);

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
      hashingService.hash.mockClear();
    });

    it('should create a user', async () => {
      // Arrange.
      repository.create.mockResolvedValue(null);

      // Act.
      await service.create(createUserInput);

      // Assert.
      expect(repository.create).toHaveBeenCalled();
    });

    it("should hash the user's password", async () => {
      // Arrange.
      repository.create.mockResolvedValue(null);

      // Act.
      await service.create(createUserInput);

      // Assert.
      expect(hashingService.hash).toHaveBeenCalled();
    });

    it.todo('should assign permission(s) to the user');

    it('should yield the created user', async () => {
      // Arrange.
      repository.create.mockResolvedValue(user);

      // Act/Assert.
      await expect(service.create(createUserInput)).resolves.toEqual(user);
    });

    it('should throw an "ExistsException" if the email or phone number is already in use', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `User with email=${createUserInput.email} or phoneNumber=${createUserInput.phoneNumber} already exists!`,
      );
      repository.create.mockRejectedValue(expectedResult);

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
      repository.update.mockClear();
      tokenStorage.remove.mockClear();
    });

    it('should update a user', async () => {
      // Arrange.
      repository.update.mockResolvedValue(user);

      // Act.
      await service.update(user.id, updateUserInput);

      // Assert.
      expect(repository.update).toHaveBeenCalled();
    });

    it.todo('should update the assigned permission(s) of the user');

    it.todo('should update the delivery window(s) for the user');

    it("should invalidate the user's access token (if issued)", async () => {
      // Arrange.
      repository.update.mockResolvedValue(user);

      // Act.
      await service.update(user.id, updateUserInput);

      // Assert.
      expect(tokenStorage.remove).toHaveBeenCalledWith(user.id);
    });

    it('should yield the updated user', async () => {
      // Arrange.
      const expectedResult = { ...user, ...updateUserInput };
      repository.update.mockResolvedValue(expectedResult);

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
      repository.update.mockRejectedValue(expectedResult);

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
      repository.remove.mockClear();
      tokenStorage.remove.mockClear();
    });

    it('should remove a user', async () => {
      // Arrange.
      repository.remove.mockResolvedValue(user);

      // Act.
      await service.remove(user.id);

      // Assert.
      expect(repository.remove).toHaveBeenCalledWith(user.id);
    });

    it("should invalidate the user's access token (if issued)", async () => {
      // Arrange.
      repository.remove.mockResolvedValue(user);

      // Act.
      await service.remove(user.id);

      // Assert.
      expect(tokenStorage.remove).toHaveBeenCalledWith(user.id);
    });

    it('should yield the removed user', async () => {
      // Arrange.
      repository.remove.mockResolvedValue(user);

      // Act/Assert.
      await expect(service.remove(user.id)).resolves.toEqual(user);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `User userId=${user.id} not found!`,
      );
      repository.remove.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.remove(user.id)).rejects.toEqual(expectedResult);
    });
  });
});
