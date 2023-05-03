import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export type MockAmqpConnection = Partial<
  Record<keyof AmqpConnection, jest.Mock>
>;

export const createAmqpConnectionMock = (): MockAmqpConnection => ({
  publish: jest.fn(),
});
