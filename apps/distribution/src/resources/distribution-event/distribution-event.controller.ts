import { ApiResponseDto, errorToHttpException } from '@hermes/common';
import { Auth, AuthType, IamPermission } from '@hermes/iam';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as _ from 'lodash';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';
import { DistributionEventService } from './distribution-event.service';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './entities/distribution-event.entity';

@ApiTags('Distribution Event')
@Controller('distribution-event')
export class DistributionEventController {
  private static readonly RESOURCE_IDENTIFIER = 'distribution_event';

  constructor(
    private readonly distributionEventService: DistributionEventService,
  ) {}

  @Get()
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: 'Find distribution event(s).',
    security: [],
  })
  @ApiQuery({
    name: 'includeRules',
    required: false,
    type: Boolean,
    description: 'Include the list of distribution rules for each event.',
  })
  @ApiQuery({
    name: 'includeSubscriptions',
    required: false,
    type: Boolean,
    description: 'Include the list of subscriptions for each event.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findAll(
    @Query('includeRules') includeRules: boolean,
    @Query('includeSubscriptions') includeSubscriptions: boolean,
  ) {
    const distributionEvents = await this.distributionEventService.findAll(
      includeRules,
      includeSubscriptions,
    );

    if (_.isEmpty(distributionEvents)) {
      throw new NotFoundException('Distribution events not found!');
    }

    return distributionEvents;
  }

  @Get(':eventType')
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: 'Find a distribution event for an event type.',
    security: [],
  })
  @ApiQuery({
    name: 'includeRules',
    required: false,
    type: Boolean,
    description: 'Include the list of distribution rules for an event.',
  })
  @ApiQuery({
    name: 'includeSubscriptions',
    required: false,
    type: Boolean,
    description: 'Include the list of subscriptions for an event.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findOne(
    @Param('eventType') eventType: string,
    @Query('includeRules') includeRules: boolean,
    @Query('includeSubscriptions') includeSubscriptions: boolean,
  ) {
    const distributionEvent = await this.distributionEventService.findOne(
      eventType,
      includeRules,
      includeSubscriptions,
    );

    if (!distributionEvent) {
      throw new NotFoundException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
    }

    return distributionEvent;
  }

  @Post()
  @IamPermission({
    resource: DistributionEventController.RESOURCE_IDENTIFIER,
    action: 'create',
  })
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
  async create(@Body() createDistributionEventDto: CreateDistributionEventDto) {
    try {
      const distributionEvent = await this.distributionEventService.create(
        createDistributionEventDto,
      );

      return new ApiResponseDto<DistributionEvent>(
        `Successfully created distribution rule for eventType=${distributionEvent.eventType}!`,
        distributionEvent,
      );
    } catch (error) {
      if (error instanceof DefaultRuleException) {
        throw new BadRequestException(error.message);
      }
      throw errorToHttpException(error);
    }
  }

  @Patch(':eventType')
  @IamPermission({
    resource: DistributionEventController.RESOURCE_IDENTIFIER,
    action: 'update',
  })
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
  async update(
    @Param('eventType') eventType: string,
    @Body() updateDistributionEventDto: UpdateDistributionEventDto,
  ) {
    try {
      const distributionEvent = await this.distributionEventService.update(
        eventType,
        updateDistributionEventDto,
      );

      return new ApiResponseDto<DistributionEvent>(
        `Successfully updated distribution event for eventType=${eventType}!`,
        distributionEvent,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Delete(':eventType')
  @IamPermission({
    resource: DistributionEventController.RESOURCE_IDENTIFIER,
    action: 'remove',
  })
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
  async remove(
    @Param('eventType') eventType: string,
  ) {
    try {
      await this.distributionEventService.remove(eventType);

      return new ApiResponseDto(
        `Successfully deleted distribution event for eventType=${eventType}!`,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }
}
