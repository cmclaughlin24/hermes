import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionType } from '../../types/subscription-type.type';
import { SubscriptionDataService } from './subscription-data.service';

describe('SubscriptionDataService', () => {
  let service: SubscriptionDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionDataService,
        {
          provide: HttpService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SubscriptionDataService>(SubscriptionDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get()', () => {});

  describe('createDto()', () => {
    it(`should yield a UserSubscriptionDto if the subscription type is "${SubscriptionType.USER}"`, async () => {});

    it(`should yield a DeviceSubscriptionDto if the subscription type is "${SubscriptionType.DEVICE}"`, async () => {});

    it(`should yield a RequestSubscriptionDto if the subscription type is "${SubscriptionType.REQUEST}"`, async () => {});

    it('should throw an error if the subscription type is not recognized', async () => {});

    it('should throw an error if the DTO is invalid (UserSubscriptionDto)', async () => {});

    it('should throw an error if the DTO is invalid (DeviceSubscriptionDto)', async () => {});

    it('should throw an error if the DTO is invalid (RequestSubscriptionDto)', async () => {});
  });

  describe('mapToUserSubscriptionDtos()', () => {
    it('should yield a list of UserSubscriptionDto(s)', async () => {});

    it('should yield null if the data is null/undefined', async () => {});

    it('should yield null if the data is an empty list', async () => {});

    it('should filter out invalid UserSubscriptionDto(s)', async () => {});
  });
});
