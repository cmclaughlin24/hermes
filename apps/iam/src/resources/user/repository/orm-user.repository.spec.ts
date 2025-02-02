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
} from '../../../../test/helpers/database.helper';
import { OrmUserRepository } from './orm-user.repository';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { DeliveryWindow } from './entities/delivery-window.entity';
import { User } from './entities/user.entity';

describe('OrmUserRepository', () => {
  let repository: OrmUserRepository;
  let userModel: MockRepository;

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
        OrmUserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
        {
          provide: getRepositoryToken(DeliveryWindow),
          useValue: createMockRepository<DeliveryWindow>(),
        },
      ],
    }).compile();

    repository = module.get<OrmUserRepository>(OrmUserRepository);
    userModel = module.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      userModel.find.mockClear();
    });

    it('should yield a list of user', async () => {
      // Arrange.
      const expectedResult = [user];
      userModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll(null)).resolves.toEqual(expectedResult);
    });

    it('should yield a list of users filtered by id', async () => {
      // Arrange.
      const ids = [randomUUID()];
      const expectedResult = {
        where: {
          id: In(ids),
        },
      };
      userModel.find.mockResolvedValue([]);

      // Act.
      await repository.findAll(ids);

      // Assert.
      expect(userModel.find).toHaveBeenCalledWith(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      userModel.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll(null)).resolves.toEqual([]);
    });
  });

  describe('findById()', () => {
    afterEach(() => {
      userModel.findOneBy.mockClear();
    });

    it('should yield a user', async () => {
      // Arrange.
      userModel.findOneBy.mockResolvedValue(user);

      // Act/Assert.
      await expect(repository.findById(user.id)).resolves.toEqual(user);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      userModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findById(user.id)).resolves.toBeNull();
    });
  });

  describe('findByEmail()', () => {
    afterEach(() => {
      userModel.findOne.mockClear();
    });

    it('should yield a user', async () => {
      // Arrange.
      userModel.findOne.mockResolvedValue(user);

      // Act/Assert.
      await expect(repository.findByEmail(user.email)).resolves.toEqual(user);
    });

    it("should include the user's permissions if requested", async () => {
      // Arrange.
      userModel.findOne.mockResolvedValue(user);

      // Act.
      await repository.findByEmail(user.email, true);

      // Assert.
      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
        relations: ['permissions'],
      });
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      userModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findByEmail(user.email)).resolves.toBeNull();
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

    afterEach(() => {
      userModel.create.mockClear();
      userModel.save.mockClear();
    });

    it('should create a user', async () => {
      // Arrange.
      userModel.save.mockResolvedValue(null);

      // Act.
      await repository.create(createUserInput);

      // Assert.
      expect(userModel.create).toHaveBeenCalled();
    });

    it.todo('should create delivery window(s) for the user');

    it('should yield the created user', async () => {
      // Arrange.
      userModel.save.mockResolvedValue(user);

      // Act/Assert.
      await expect(repository.create(createUserInput)).resolves.toEqual(user);
    });

    it('should throw an "ExistsException" if the email or phone number is already in use', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `User with email=${createUserInput.email} or phoneNumber=${createUserInput.phoneNumber} already exists!`,
      );
      userModel.save.mockRejectedValue({
        code: PostgresError.UNIQUE_VIOLATION,
      });

      // Act/Assert.
      await expect(repository.create(createUserInput)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const updateUserInput: UpdateUserInput = {
      email: 'blaze.cat@sega.com',
    };

    afterEach(() => {
      userModel.preload.mockClear();
      userModel.save.mockClear();
    });

    it('should update a user', async () => {
      // Arrange.
      userModel.preload.mockResolvedValue({});
      userModel.save.mockResolvedValue(user);

      // Act.
      await repository.update(user.id, updateUserInput);

      // Assert.
      expect(userModel.preload).toHaveBeenCalled();
    });

    it.todo('should update the delivery window(s) for the user');

    it('should yield the updated user', async () => {
      // Arrange.
      const expectedResult = { ...user, ...updateUserInput };
      userModel.preload.mockResolvedValue(expectedResult);
      userModel.save.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        repository.update(user.id, updateUserInput),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `User userId=${user.id} not found!`,
      );
      userModel.preload.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.update(user.id, updateUserInput)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('remove()', () => {
    beforeEach(() => {
      userModel.remove.mockResolvedValue(user);
    });

    afterEach(() => {
      userModel.findOneBy.mockClear();
      userModel.remove.mockClear();
    });

    it('should remove a user', async () => {
      // Arrange.
      userModel.findOneBy.mockResolvedValue(user);

      // Act.
      await repository.remove(user.id);

      // Assert.
      expect(userModel.remove).toHaveBeenCalledWith(user);
    });

    it('should yield the removed user', async () => {
      // Arrange.
      userModel.findOneBy.mockResolvedValue(user);

      // Act/Assert.
      await expect(repository.remove(user.id)).resolves.toEqual(user);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `User userId=${user.id} not found!`,
      );
      userModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.remove(user.id)).rejects.toEqual(expectedResult);
    });
  });
});
