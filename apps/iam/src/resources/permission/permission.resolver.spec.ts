import { ApolloServerErrorCode } from '@apollo/server/errors';
import { ExistsException, MissingException } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import {
  MockPermissionService,
  createPermissionServiceMock,
} from '../../../test/helpers/provider.helper';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { Permission } from './entities/permission.entity';
import { PermissionResolver } from './permission.resolver';
import { PermissionService } from './permission.service';

describe('PermissionResolver', () => {
  let resolver: PermissionResolver;
  let service: MockPermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionResolver,
        { provide: PermissionService, useValue: createPermissionServiceMock() },
      ],
    }).compile();

    resolver = module.get<PermissionResolver>(PermissionResolver);
    service = module.get<MockPermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      service.findAll.mockClear();
    });

    it('should yield a list of permissions', async () => {
      // Arrange.
      const expectedResult: Permission[] = [
        {
          id: randomUUID(),
          resource: 'VideoGameCharacters',
          action: 'list',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(resolver.findAll()).resolves.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    const permissionId = randomUUID();

    afterEach(() => {
      service.findById.mockClear();
    });

    it('should yield a permission', async () => {
      // Arrange.
      const expectedResult: Permission = {
        id: permissionId,
        resource: 'VideoGameCharacters',
        action: 'get',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.findById.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(resolver.findOne(permissionId)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new GraphQLError(
        `Permission id=${permissionId} not found!`,
        {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
        },
      );
      service.findById.mockResolvedValue(null);

      // Act/Assert.
      await expect(resolver.findOne(permissionId)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('create()', () => {
    const createPermissionInput: CreatePermissionInput = {
      resource: 'VideoGameCharacters',
      action: 'create',
    };

    afterEach(() => {
      service.create.mockClear();
    });

    it('should yield the created permission', async () => {
      // Arrange.
      const expectedResult: Permission = {
        id: randomUUID(),
        resource: createPermissionInput.resource,
        action: createPermissionInput.action,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.create.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(resolver.create(createPermissionInput)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if a permission already exists', async () => {
      // Arrange.
      const errorMessage = `Permission for resource=${createPermissionInput.resource} action=${createPermissionInput.action} already exists!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
      service.create.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(resolver.create(createPermissionInput)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const permissionId = randomUUID();
    const updatePermissionInput: UpdatePermissionInput = {
      resource: 'VideoGameCharacters',
      action: 'update',
    };

    afterEach(() => {
      service.update.mockClear();
    });

    it('should yield the updated permission', async () => {
      // Arrange.
      const expectedResult: Permission = {
        id: permissionId,
        resource: updatePermissionInput.resource,
        action: updatePermissionInput.action,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.update.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        resolver.update(permissionId, updatePermissionInput),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if a permission does not exist', async () => {
      // Arrange.
      const errorMessage = `Permission id=${permissionId} not found!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
      service.update.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        resolver.update(permissionId, updatePermissionInput),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const permissionId = randomUUID();

    afterEach(() => {
      service.remove.mockClear();
    });

    it('should yield the deleted permission', async () => {
      // Arrange.
      const expectedResult: Permission = {
        id: permissionId,
        resource: 'VideoGameCharacters',
        action: 'remove',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(resolver.remove(permissionId)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if a permission does not exist', async () => {
      // Arrange.
      const errorMessage = `Permission id=${permissionId} not found!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
      service.remove.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(resolver.remove(permissionId)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
