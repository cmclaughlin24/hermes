import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createConfigServiceMock,
  createDistributionLogServiceMock,
} from '../../../../test/helpers/provider.helper';
import { DistributionLogService } from '../../../resources/distribution-log/distribution-log.service';
import { MqInterceptor } from './mq.interceptor';

describe('MqInterceptor', () => {
  let interceptor: MqInterceptor;

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
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
      ],
    }).compile();

    interceptor = module.get<MqInterceptor>(MqInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept()', () => {});
});
