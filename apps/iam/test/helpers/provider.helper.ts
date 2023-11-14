import { CacheStore } from '@nestjs/cache-manager';
import { UserService } from '../../src/resources/user/user.service';

export type MockCacheStore = Partial<Record<keyof CacheStore, jest.Mock>>;

export const createCacheStoreMock = (): MockCacheStore => ({
  get: jest.fn(),
  set: jest.fn(async () => {}),
  del: jest.fn(),
});

export type MockUserService = Partial<Record<keyof UserService, jest.Mock>>;

export const createUserServiceMock = (): MockUserService => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});
