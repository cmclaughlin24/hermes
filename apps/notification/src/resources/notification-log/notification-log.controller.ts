import { DeliveryMethods } from '@hermes/common';
import { Public } from '@hermes/iam';
import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseArrayPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JobState } from 'bullmq';
import * as _ from 'lodash';
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
    enum: ['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findAll(
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
    const notificationLogs = await this.notificationLogService.findAll(
      jobs,
      states,
    );

    if (_.isEmpty(notificationLogs)) {
      throw new NotFoundException(`Notification logs not found!`);
    }

    return notificationLogs;
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: "Find a log by it's id.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findOne(@Param('id') id: string) {
    const notificationLog = await this.notificationLogService.findOne(id);

    if (!notificationLog) {
      throw new NotFoundException(`Notification Log with ${id} not found!`);
    }

    return notificationLog;
  }
}
