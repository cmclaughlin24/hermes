import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@notification/common';
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
    summary: 'Find logs by their queue, message type, and/or states.',
    security: [],
  })
  @ApiQuery({
    name: 'queue',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of Rabbitmq queues.',
  })
  @ApiQuery({
    name: 'messageType',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of message types.',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of states.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll(
    @Query(
      'queue',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    queues: string[],
    @Query(
      'messageType',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    messageTypes: string[],
    @Query(
      'state',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    states: string[],
  ) {
    return this.distributionLogService.findAll(queues, messageTypes, states);
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
