import { Auth, AuthType } from '@hermes/iam';
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
import * as _ from 'lodash';
import { DistributionLogService } from './distribution-log.service';

@ApiTags('Distribution Log')
@Controller('distribution-log')
export class DistributionLogController {
  constructor(
    private readonly distributionLogService: DistributionLogService,
  ) {}

  @Get()
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: 'Find logs by their event type, and/or states.',
    security: [],
  })
  @ApiQuery({
    name: 'eventType',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of event types.',
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
  async findAll(
    @Query(
      'eventType',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    eventTypes: string[],
    @Query(
      'state',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    states: string[],
  ) {
    const distributionLogs = await this.distributionLogService.findAll(
      eventTypes,
      states,
    );

    if (_.isEmpty(distributionLogs)) {
      throw new NotFoundException(`Distribution logs not found!`);
    }

    return distributionLogs;
  }

  @Get(':id')
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: "Find a log by it's id.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findOne(@Param('id') id: string) {
    const distributionLog = await this.distributionLogService.findOne(id);

    if (!distributionLog) {
      throw new NotFoundException(`Distribution log with id=${id} not found!`);
    }

    return distributionLog;
  }
}
