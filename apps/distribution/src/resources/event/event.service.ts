import { Injectable } from '@nestjs/common';

@Injectable()
export class EventService {
  findAll() {}

  findOne(name: string) {}

  create(createEventDto: any) {}

  update(name: string, updateEventDto: any) {}

  remove(name: string) {}
}
