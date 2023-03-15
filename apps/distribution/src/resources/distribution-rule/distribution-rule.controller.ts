import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto, Public } from '@notification/common';
import { DistributionRuleService } from './distribution-rule.service';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';

@ApiTags('Distribution Rule')
@Controller('distribution-rule')
export class DistributionRuleController {
  constructor(
    private readonly distributionRuleService: DistributionRuleService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find distribution rules by their queue(s).',
    security: [],
  })
  @ApiQuery({
    name: 'queue',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of distribution queues.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll(
    @Query(
      'queue',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    queues: string[],
  ) {
    return this.distributionRuleService.findAll(queues);
  }

  @Get(':queue/:event')
  @Public()
  @ApiOperation({
    summary: 'Find a distribution rule for a queue and event.',
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(@Param('queue') queue: string, @Param('event') event: string) {
    return this.distributionRuleService.findOne(queue, event);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a distribution rule.',
    security: [{ ApiAuthKey: [] }],
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successful Operation',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid Request',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Resource',
  })
  create(@Body() createDistributionRuleDto: CreateDistributionRuleDto) {
    return this.distributionRuleService.create(createDistributionRuleDto);
  }

  @Patch(':queue/:event')
  @ApiOperation({
    summary: 'Update a distribution rule.',
    security: [{ ApiAuthKey: [] }],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful Operation',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid Request',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Resource',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  update(
    @Param('queue') queue: string,
    @Param('event') event: string,
    @Body() updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    return this.distributionRuleService.update(
      queue,
      event,
      updateDistributionRuleDto,
    );
  }

  @Delete(':queue/:event')
  @ApiOperation({
    summary: 'Remove a distribution rule.',
    security: [{ ApiAuthKey: [] }],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful Operation',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Resource',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  remove(@Param('queue') queue: string, @Param('event') event: string) {
    return this.distributionRuleService.remove(queue, event);
  }
}
