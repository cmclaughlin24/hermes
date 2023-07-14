import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionType } from '../../types/subscription-type.type';
import { SubscriptionDataService } from './subscription-data.service';

export type MockHttpService = Partial<Record<keyof HttpService, jest.Mock>>;

export const createHttpServiceMock = (): MockHttpService => ({
  get: jest.fn(),
});

describe('SubscriptionDataService', () => {
  let service: SubscriptionDataService;
  let httpService: MockHttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionDataService,
        {
          provide: HttpService,
          useValue: createHttpServiceMock(),
        },
      ],
    }).compile();

    service = module.get<SubscriptionDataService>(SubscriptionDataService);
    httpService = module.get<MockHttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get()', () => {});

  describe('createDto()', () => {
    it(`should yield a UserSubscriberDto if the subscription type is "${SubscriptionType.USER}"`, async () => {});

    it(`should yield a DeviceSubscriberDto if the subscription type is "${SubscriptionType.DEVICE}"`, async () => {});

    it(`should yield a RequestSubscriberDto if the subscription type is "${SubscriptionType.REQUEST}"`, async () => {});

    it('should throw an error if the subscription type is not recognized', async () => {});

    it('should throw an error if the DTO is invalid (UserSubscriberDto)', async () => {});

    it('should throw an error if the DTO is invalid (DeviceSubscriberDto)', async () => {});

    it('should throw an error if the DTO is invalid (RequestSubscriberDto)', async () => {});
  });

  describe('mapToUserSubscriberDtos()', () => {
    it('should yield a list of UserSubscriberDto(s)', async () => {});

    it('should yield null if the data is null/undefined', async () => {});

    it('should yield null if the data is an empty list', async () => {});

    it('should filter out invalid UserSubscriberDto(s)', async () => {});
  });
});
