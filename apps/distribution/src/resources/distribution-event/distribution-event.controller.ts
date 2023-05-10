import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto, Public } from '@notification/common';
import { DistributionEventService } from './distribution-event.service';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';

@ApiTags('Distribution Event')
@Controller('distribution-event')
export class DistributionEventController {
  constructor(
    private readonly distributionEventService: DistributionEventService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find distribution event(s).',
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll() {
    return this.distributionEventService.findAll();
  }

  @Get(':queue/:messageType')
  @Public()
  @ApiOperation({
    summary: 'Find a distribution event for a queue and message type.',
    security: [],
  })
  @ApiQuery({
    name: 'includeRules',
    required: false,
    type: Boolean,
    description: 'Include the list of distribution rules for an event.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(
    @Param('queue') queue: string,
    @Param('messageType') messageType: string,
    @Query('includeRules') includeRules: boolean,
  ) {
    return this.distributionEventService.findOne(
      queue,
      messageType,
      includeRules,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create a distribution event.',
    security: [{ ApiKeyAuth: [] }],
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
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  create(@Body() createDistributionEventDto: CreateDistributionEventDto) {
    return this.distributionEventService.create(createDistributionEventDto);
  }

  @Patch(':queue/:messageType')
  @ApiOperation({
    summary: 'Update a distribution event.',
    security: [{ ApiKeyAuth: [] }],
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
    @Param('messageType') messageType: string,
    @Body() updateDistributionEventDto: UpdateDistributionEventDto,
  ) {
    return this.distributionEventService.update(
      queue,
      messageType,
      updateDistributionEventDto,
    );
  }

  @Delete(':queue/:messageType')
  @ApiOperation({
    summary: 'Remove a distribution event.',
    security: [{ ApiKeyAuth: [] }],
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
  remove(
    @Param('queue') queue: string,
    @Param('messageType') messageType: string,
  ) {
    return this.distributionEventService.remove(queue, messageType);
  }
}
