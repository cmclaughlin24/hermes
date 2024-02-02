import { TokenService } from '@hermes/iam';
import { CacheStore } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from '../../src/common/services/hashing.service';
import { TokenStorage } from '../../src/common/storage/token.storage';
import { PermissionService } from '../../src/resources/permission/permission.service';
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

export type MockHashingService = Partial<
  Record<keyof HashingService, jest.Mock>
>;

export const createHashingServiceMock = (): MockHashingService => ({
  hash: jest.fn(),
  compare: jest.fn(),
});

export type MockJwtService = Partial<Record<keyof JwtService, jest.Mock>>;

export const createJwtServiceMock = (): MockJwtService => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
});

export type MockTokenStorage = Partial<Record<keyof TokenStorage, jest.Mock>>;

export const createTokenStorage = (): MockTokenStorage => ({
  insert: jest.fn(),
  validateRefresh: jest.fn(),
  validateJwt: jest.fn(),
  remove: jest.fn(),
});

export type MockPermissionService = Partial<
  Record<keyof PermissionService, jest.Mock>
>;

export const createPermissionServiceMock = (): MockPermissionService => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByResourceAction: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

export type MockUserService = Partial<Record<keyof UserService, jest.Mock>>;

export const createUserServiceMock = (): MockUserService => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findDeliveryWindows: jest.fn(),
  findPermissions: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

/**
 * Yields a tuple containing a mock `TokenService` and a mock function
 * for setting the returned `ActiveEntityData`.
 * @returns {[TokenService, jest.Mock]}
 */
export const createTokenServiceMock = (): [TokenService, jest.Mock] => {
  const setActiveEntityData = jest.fn();

  const tokenService = {
    verifyAccessToken: async function (token: string) {
      if (token === process.env.ACCESS_TOKEN) {
        return setActiveEntityData();
      }
      return null;
    },
    verifyApiKey: async function (apiKey: string) {
      if (apiKey === process.env.API_KEY) {
        return setActiveEntityData();
      }
      return null;
    },
  };

  return [tokenService, setActiveEntityData];
};
