import { Queue } from 'bullmq';

export type MockQueue = Partial<Record<keyof Queue, jest.Mock>>;

export const createQueueMock = (): MockQueue => ({
  add: jest.fn(),
  addBulk: jest.fn(),
  getJob: jest.fn(),
  getJobs: jest.fn(),
});
