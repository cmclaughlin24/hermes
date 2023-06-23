import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createConfigServiceMock, createDistributionEventServiceMock } from '../../../../test/helpers/provider.helper';
import { SubscriptionDataService } from '../../../common/providers/subscription-data/subscription-data.service';
import { DistributionEventService } from '../../../resources/distribution-event/distribution-event.service';
import { DistributionConsumer } from './distribution.consumer';

describe('DistributionConsumer', () => {
  let provider: DistributionConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionConsumer,
        {
          provide: DistributionEventService,
          useValue: createDistributionEventServiceMock(),
        },
        {
          provide: SubscriptionDataService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: createConfigServiceMock()
        }
      ],
    }).compile();

    provider = module.get<DistributionConsumer>(DistributionConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
