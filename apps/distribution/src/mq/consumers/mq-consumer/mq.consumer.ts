import { MqUnrecoverableError } from 'apps/distribution/src/common/classes/mq-unrecoverable-error.class';
import { MessageDto } from 'apps/distribution/src/common/dto/message.dto';
import { validateOrReject } from 'class-validator';

// Note: MqConsumer is a parent class for storing commonized functionality required
//       by all consumers.

export class MqConsumer {
  /**
   * Yields a MessageDto or throws a MqUnrecoverableError if the message properties
   * fail validation.
   * @param {any} message
   * @returns {Promise<MessageDto>}
   */
  protected async createMessageDto(message: any) {
    const messageDto = new MessageDto();

    messageDto.id = message.id;
    messageDto.type = message.type;
    messageDto.metadata = message.metadata;
    messageDto.payload = message.payload;
    messageDto.addedAt = message.addedAt;
    messageDto.recipients = message.recipients;

    try {
      await validateOrReject(messageDto);
    } catch (errors) {
      const validationErrors = errors
        .map((error) => error.toString())
        .join(', ');
      throw new MqUnrecoverableError(validationErrors);
    }

    return messageDto;
  }

  /**
   * Yields a formatted string with the function's name in square brackets followed
   * by the RabbitMQ message id.
   * @example
   * - '[functionName] Message messageId'
   * @param {string} functionName
   * @param {string} messageId
   * @returns {string}
   */
  protected createLogPrefix(functionName: string, messageId: string): string {
    return `[${functionName}] Message ${messageId}`;
  }
}
