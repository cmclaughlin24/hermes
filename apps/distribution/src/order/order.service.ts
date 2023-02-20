import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(@InjectQueue('notification') private readonly notificationQueue: Queue) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createOrder(createOrderDto: any) {
    const job = await this.notificationQueue.add('email', createOrderDto);

    this.logger.log(`Email Notification ${job.id} added to queue`);
  }
}
