import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DistributionQueues, Public } from '@notification/common';
import { JobStatus } from 'bull';
import { DistributionLogService } from './distribution-log.service';

@ApiTags('Distribution Log')
@Controller('distribution-log')
export class DistributionLogController {
  constructor(
    private readonly distributionLogService: DistributionLogService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find logs by their queue, rule, and/or status.',
    security: [],
  })
  @ApiQuery({
    name: 'queue',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of distribution queues',
  })
  @ApiQuery({
    name: 'rule',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of distribution rules',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of job statuses',
    enum: ['active', 'completed', 'delayed', 'failed', 'paused', 'waiting']
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll(
    @Query(
      'queue',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    queues: DistributionQueues[],
    @Query(
      'rule',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    rules: string[],
    @Query(
      'status',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    statuses: JobStatus[],
  ) {
    return this.distributionLogService.findAll(queues, rules, statuses);
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
    return this.distributionLogService.findOne(id);
  }
}
