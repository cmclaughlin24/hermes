import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import {
  MockReflector,
  createReflectorMock,
} from '../../../../test/helpers/core.helper';
import {
  MockDistributionLogService,
  createConfigServiceMock,
  createDistributionLogServiceMock,
} from '../../../../test/helpers/provider.helper';
import { MqUnrecoverableError } from '../../../mq/classes/mq-unrecoverable-error.class';
import { DistributionLogService } from '../../../resources/distribution-log/distribution-log.service';
import { MqInterceptor } from './mq.interceptor';

jest.mock('@golevelup/nestjs-rabbitmq');

describe('MqInterceptor', () => {
  let interceptor: MqInterceptor;
  let distributionLogService: MockDistributionLogService;
  let reflector: MockReflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MqInterceptor,
        {
          provide: DistributionLogService,
          useValue: createDistributionLogServiceMock(),
        },
        {
          provide: Reflector,
          useValue: createReflectorMock(),
        },
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
      ],
    }).compile();

    interceptor = module.get<MqInterceptor>(MqInterceptor);
    distributionLogService = module.get<MockDistributionLogService>(
      DistributionLogService,
    );
    reflector = module.get<MockReflector>(Reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept()', () => {
    const context: any = {
      getHandler: jest.fn(),
      switchToRpc: jest.fn(() => ({
        getData: jest.fn(),
        getContext: jest.fn(() => ({
          properties: {
            headers: { 'x-death': [] },
          },
        })),
      })),
    };
    const next = { handle: jest.fn() };

    afterEach(() => {
      distributionLogService.log.mockClear();
      next.handle.mockClear();
    });

    it('should yield an Observable representing the response stream from the route handler w/logging if the context type is "rmq"', async () => {
      // Arrange.
      // @ts-ignore
      isRabbitContext.mockReturnValue(true);
      next.handle.mockImplementation(() => of(null));
      reflector.get.mockReturnValue({});

      // Act.
      const result = await interceptor.intercept(context, next);

      // Assert.
      expect(result).toBeInstanceOf(Observable);
      expect(distributionLogService.log).toHaveBeenCalled();
    });

    it('should yield an Observable representing the response stream from the route handler w/o logging if the context type is not "rmq"', async () => {
      // Arrange.
      // @ts-ignore
      isRabbitContext.mockReturnValue(false);
      next.handle.mockImplementation(() => of(null));

      // Act.
      const result = await interceptor.intercept(context, next);

      // Assert.
      expect(result).toBeInstanceOf(Observable);
      expect(distributionLogService.log).not.toHaveBeenCalled();
    });

    it('should catch a successful response and log it to the database', async () => {
      // Arrange.
      // @ts-ignore
      isRabbitContext.mockReturnValue(true);
      next.handle.mockImplementation(() => of(null));
      reflector.get.mockReturnValue({});

      // Act.
      const stream = await interceptor.intercept(context, next);
      await firstValueFrom(stream);

      // Assert.
      expect(distributionLogService.log).toHaveBeenCalledTimes(2);
    });

    it('should catch an error response and log it to the database (failure w/retry)', async () => {
      // Arrange.
      // @ts-ignore
      isRabbitContext.mockReturnValue(true);
      next.handle.mockImplementation(() => throwError(() => new Error('')));
      reflector.get.mockReturnValue({});

      // Act.
      const stream = await interceptor.intercept(context, next);
      await firstValueFrom(stream);

      // Assert.
      expect(distributionLogService.log).toHaveBeenCalledTimes(2);
    });

    it('should catch an error response and log it to the database (failure w/o retry)', async () => {
      // Arrange.
      // @ts-ignore
      isRabbitContext.mockReturnValue(true);
      next.handle.mockImplementation(() =>
        throwError(() => new MqUnrecoverableError('')),
      );
      reflector.get.mockReturnValue({});

      // Act.
      const stream = await interceptor.intercept(context, next);
      await firstValueFrom(stream);

      // Assert.
      expect(distributionLogService.log).toHaveBeenCalledTimes(2);
    });
  });
});
