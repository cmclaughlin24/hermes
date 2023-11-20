import { CacheStore } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../src/resources/user/user.service';

export type MockCacheStore = Partial<Record<keyof CacheStore, jest.Mock>>;

export const createCacheStoreMock = (): MockCacheStore => ({
  get: jest.fn(),
  set: jest.fn(async () => {}),
  del: jest.fn(),
});

export type MockConfigService = Partial<Record<keyof ConfigService, jest.Mock>>;

export const createConfigServiceMock = (): MockConfigService => ({
  get: jest.fn(),
});

export type MockJwtService = Partial<Record<keyof JwtService, jest.Mock>>;

export const createJwtServiceMock = (): MockJwtService => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
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
