import { MessageDto } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MqUnrecoverableError } from '../../classes/mq-unrecoverable-error.class';
import { MqConsumer } from './mq.consumer';

describe('MqConsumer', () => {
  let provider: MqConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MqConsumer],
    }).compile();

    provider = module.get<MqConsumer>(MqConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createLogPrefix()', () => {
    it('should yield a formatted string', () => {
      // Arrange.
      const id = 'e63dde9d-606c-4938-b9aa-86813de1f09f';
      const myFn = () => {};
      const expectedResult = `[${myFn.name}] Message ${id}`;

      // Act.
      const result = provider.createLogPrefix(myFn.name, id);

      // Assert.
      expect(result).toBe(expectedResult);
    });
  });

  describe('createMessageDto()', () => {
    const message = {
      id: 'e63dde9d-606c-4938-b9aa-86813de1f09f',
      type: 'unit-test',
      metadata: null,
      payload: {},
      addedAt: new Date().toISOString(),
    };

    it('should yield a "MessageDto" object', async () => {
      // Arrange.
      const expectedResult = new MessageDto();
      expectedResult.id = message.id;
      expectedResult.type = message.type;
      expectedResult.metadata = message.metadata;
      expectedResult.payload = message.payload;
      expectedResult.addedAt = message.addedAt;

      // Act/Assert.
      await expect(provider.createMessageDto(message)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw an "MqUnrecoverableError" if the created "MessageDto" object is invalid', async () => {
      // Arrange.
      const invalidMessage = {
        ...message,
        type: null,
      };

      // Act/Assert.
      await expect(
        provider.createMessageDto(invalidMessage),
      ).rejects.toBeInstanceOf(MqUnrecoverableError);
    });
  });
});
