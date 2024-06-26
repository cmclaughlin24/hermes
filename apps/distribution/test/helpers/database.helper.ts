import { Repository, Sequelize } from 'sequelize-typescript';

export type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

export const createMockRepository = <T = any>(): MockRepository<T> => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
});

export type MockSequelize = Partial<Record<keyof Sequelize, jest.Mock>>;

export const createMockSequelize = (): MockSequelize => ({
  transaction: jest.fn(),
});