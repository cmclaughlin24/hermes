import { Repository } from 'typeorm';

export type MockRepository<T = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

export const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  save: jest.fn(),
});
