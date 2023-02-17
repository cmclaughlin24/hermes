import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JobStatus } from 'bull';
import { NotificationLogService } from './notification-log.service';

@ApiTags('Notification Log')
@Controller('notification-log')
export class NotificationLogController {
  constructor(
    private readonly notificationLogService: NotificationLogService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Find logs by their job name or status.',
  })
  @ApiQuery({
    name: 'job',
    required: false,
    type: String,
    description: 'A comma seperated list of notification job names',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'A comma seperated list of job statuses',
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
      'status',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    statuses: JobStatus[] = [],
  ) {
    return this.notificationLogService.findAll(jobs, statuses);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Find a log by it's id.",
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.notificationLogService.findOne(id);
  }
}
