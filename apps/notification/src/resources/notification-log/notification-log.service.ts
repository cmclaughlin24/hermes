import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationLog } from './entities/notification-log.entity';

@Injectable()
export class NotificationLogService {
  constructor(
    @InjectModel(NotificationLog)
    private readonly notificationLogModel: typeof NotificationLog,
  ) {}

  async findAll() {}

  async findOne(id: string) {
    const notificationLog = await this.notificationLogModel.findByPk(id);

    if (!notificationLog) {
      throw new NotFoundException(`Notification Log with ${id} not found!`);
    }

    return notificationLog;
  }

  createOrUpdate() {}
}
