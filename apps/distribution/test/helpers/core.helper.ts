import { Reflector } from '@nestjs/core';

export type MockReflector = Partial<Record<keyof Reflector, jest.Mock>>;

export const createReflectorMock = (): MockReflector => ({
  get: jest.fn(),
});
