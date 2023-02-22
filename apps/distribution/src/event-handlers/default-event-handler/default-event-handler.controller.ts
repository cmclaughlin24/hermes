import { InjectQueue } from '@nestjs/bull';
import { Controller } from '@nestjs/common';
import { Queue } from 'bull';

export function createDefaultEventHandlerController(name: string) {
  @Controller()
  class DefaultEventHandlerController {
    static readonly prefix = name;

    constructor(
      @InjectQueue('notification') public readonly notificationQueue: Queue,
    ) {}

    listen() {
      // Fixme: Use @EventPattern(name) to handle events.
    }
  }

  return DefaultEventHandlerController;
}
