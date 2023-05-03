import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeliveryMethods, Public } from '@notification/common';
import { JobState } from 'bullmq';
import { NotificationLogService } from './notification-log.service';

@ApiTags('Notification Log')
@Controller('notification-log')
export class NotificationLogController {
  constructor(
    private readonly notificationLogService: NotificationLogService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find logs by their job name and/or states.',
    security: [],
  })
  @ApiQuery({
    name: 'job',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of notification job names.',
    enum: DeliveryMethods,
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of job states.',
    enum: ['active', 'completed', 'delayed', 'failed', 'paused', 'waiting']
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll(
    @Query(
      'job',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    jobs: string[] = [],
    @Query(
      'state',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    states: JobState[] = [],
  ) {
    return this.notificationLogService.findAll(jobs, states);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: "Find a log by it's id.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.notificationLogService.findOne(id);
  }
}
