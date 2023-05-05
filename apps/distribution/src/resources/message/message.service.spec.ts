import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto } from '@notification/common';
import {
  MockAmqpConnection,
  createAmqpConnectionMock,
} from '../../../test/helpers/amqp-connection.helper';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let amqpConnection: MockAmqpConnection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: AmqpConnection,
          useValue: createAmqpConnectionMock(),
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    amqpConnection = module.get<MockAmqpConnection>(AmqpConnection);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const createMessageDto: CreateMessageDto = {
      exchange: 'test',
      routingKey: 'test.*',
      message: {
        id: '',
        type: 'test',
        payload: null,
      },
    };

    afterEach(() => {
      amqpConnection.publish.mockClear();
    });

    it('should publish a message with a routing key to the exchange', async () => {
      // Act.
      await service.create(createMessageDto);

      // Assert.
      expect(amqpConnection.publish).toHaveBeenCalledWith(
        createMessageDto.exchange,
        createMessageDto.routingKey,
        createMessageDto.message,
      );
    });

    it('should yield an "ApiResponseDto" object', () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully sent message to ${createMessageDto.exchange}!`,
      );

      // Act/Assert.
      expect(service.create(createMessageDto)).resolves.toEqual(expectedResult);
    });
  });
});
