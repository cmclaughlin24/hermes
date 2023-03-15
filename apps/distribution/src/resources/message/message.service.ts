import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ApiResponseDto } from '@notification/common';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async create({ exchange, routingKey, message }: CreateMessageDto) {
    await this.amqpConnection.publish(exchange, routingKey, message);
    return new ApiResponseDto(`Successfully sent message to ${exchange}!`);
  }
}
