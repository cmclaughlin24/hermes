import { ApolloServerErrorCode } from '@apollo/server/errors';
import { MissingException } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import {
  MockUserService,
  createUserServiceMock,
} from '../../../test/helpers/provider.helper';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let service: MockUserService;

  const userId = randomUUID();
  const user: User = {
    id: userId,
    email: 'knuckles.echidna@sega.com',
    phoneNumber: '+19999999999',
    password: 'super-secret-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: createUserServiceMock(),
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    service = module.get<MockUserService>(UserService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll()', () => {
    it('should yield a list of users', async () => {
      // Arrange.
      const expectedResult: User[] = [user];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(resolver.findAll()).resolves.toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    afterEach(() => {
      service.findById.mockClear();
    });

    it('should yield a user', async () => {
      // Arrange.
      service.findById.mockResolvedValue(user);

      // Act/Assert.
      await expect(resolver.findOne(userId)).resolves.toEqual(user);
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new GraphQLError(
        `User userId=${userId} not found!`,
        {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
        },
      );
      service.findById.mockResolvedValue(null);

      // Act/Assert.
      await expect(resolver.findOne(userId)).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    afterEach(() => {
      service.create.mockClear();
    });

    it('should yield the created user', async () => {
      // Arrange.
      service.create.mockResolvedValue(user);

      // Act/Assert.
      await expect(resolver.create({} as CreateUserInput)).resolves.toEqual(
        user,
      );
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if a user\'s email/phone number already exists', async () => {
      // Arrange.
      const errorMessage = `User with email=${user.email} or phoneNumber=${user.phoneNumber} already exists!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
      service.create.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(resolver.create({} as CreateUserInput)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    afterEach(() => {
      service.update.mockClear();
    });

    it('should yield the updated user', async () => {
      // Arrange.
      service.update.mockResolvedValue(user);

      // Act/Assert.
      await expect(resolver.update(userId, user)).resolves.toEqual(user);
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if the user does not exist', async () => {
      // Arrange.
      const errorMessage = `User userId=${userId} not found!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
      service.update.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(resolver.update(userId, user)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('remove()', () => {
    afterEach(() => {
      service.delete.mockClear();
    });

    it('should yield the deleted user', async () => {
      // Arrange.
      service.delete.mockResolvedValue(user);

      // Act/Assert.
      await expect(resolver.delete(userId)).resolves.toEqual(user);
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if a user does not exist', async () => {
      // Arrange.
      const errorMessage = `User userId=${userId} not found!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
      service.delete.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(resolver.delete(userId)).rejects.toEqual(expectedResult);
    });
  });
});
