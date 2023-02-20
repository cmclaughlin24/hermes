import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from 'nestjs-twilio';
import { createConfigServiceMock } from '../../../../../notification/test/helpers/provider.helpers';
import { PhoneService } from './phone.service';

const createTwilioServiceMock = () => ({
  client: {
    messages: {
      create: jest.fn(),
    },
  },
});

describe('PhoneService', () => {
  let service: PhoneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneService,
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
        {
          provide: TwilioService,
          useValue: createTwilioServiceMock(),
        },
      ],
    }).compile();

    service = module.get<PhoneService>(PhoneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendText()', () => {
    it('should send a text notification', () => {
      // Arrange.
      // Act.
      // Assert.
    });
    
    it('should throw an error otherwise', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('createNotificationDto()', () => {
    it('should yield a CreatePhoneNotificationDto object', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw an error if data is null/undefined', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw an error if data is not an object (primitive)', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw an error if data is not an object (array)', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw an error if data is an invalid CreatePhoneNotificationDto', async () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });
});
