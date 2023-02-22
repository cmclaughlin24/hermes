import { Controller, Get } from '@nestjs/common';

export function createDefaultEventHandlerController(name: string) {
  @Controller(name)
  class DefaultEventHandlerController {
    @Get()
    success() {
      return `Successfully made request to ${name}`;
    }
  }

  return DefaultEventHandlerController;
}
