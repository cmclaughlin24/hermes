import { ApiResponseDto } from '@hermes/common';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

export type MockMessageService = Partial<
  Record<keyof MessageService, jest.Mock>
>;

export const createMessageServiceMock = (): MockMessageService => ({
  create: jest.fn(),
});

describe('MessageController', () => {
  let controller: MessageController;
  let service: MockMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: createMessageServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get<MockMessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    const createMessageDto: CreateMessageDto = {
      exchange: '',
      routingKey: '',
      message: {
        id: '',
        type: '',
        payload: null,
        metadata: null,
        addedAt: null,
      },
    };

    afterEach(() => {
      service.create.mockClear();
    });

    it('should yield an "ApiResponseDto" object', () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully sent message to ${createMessageDto.exchange}!`,
      );
      service.create.mockResolvedValue(null);

      // Act/Assert.
      expect(controller.create(createMessageDto)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "HttpException" if an error occurred', async () => {
      // Arrange.
      service.create.mockRejectedValue(new Error());

      // Act/Assert.
      await expect(controller.create(createMessageDto)).rejects.toBeInstanceOf(
        HttpException,
      );
    });
  });
});
