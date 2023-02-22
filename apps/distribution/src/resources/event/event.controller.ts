import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.eventService.findOne(name);
  }

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Patch(':name')
  update(@Param('name') name: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(name, updateEventDto);
  }

  @Delete(':name')
  remove(@Param('name') name: string) {
    return this.eventService.remove(name);
  }
}
