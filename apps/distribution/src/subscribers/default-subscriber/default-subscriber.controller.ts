import { Controller, Get } from '@nestjs/common';

export function createDefaultSubscriberController(name: string) {
  @Controller(name)
  class DefaultSubscriberController {
    @Get()
    success() {
      return `Successfully made request to ${name}`;
    }
  }

  return DefaultSubscriberController;
}
