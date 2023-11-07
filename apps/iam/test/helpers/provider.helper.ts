import { UserService } from '../../src/resources/user/user.service';

export type MockUserService = Partial<Record<keyof UserService, jest.Mock>>;

export const createUserServiceMock = (): MockUserService => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});
