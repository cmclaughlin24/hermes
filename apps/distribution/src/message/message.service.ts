import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  /**
   * Publishes a message to an exchange.
   * @param {CreateMessageDto} createMessageDto
   * @returns {Promise<void>}
   */
  async create({ exchange, routingKey, message }: CreateMessageDto) {
    await this.amqpConnection.publish(exchange, routingKey, message);
  }
}
