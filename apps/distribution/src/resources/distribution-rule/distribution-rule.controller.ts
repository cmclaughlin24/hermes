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
  ParseArrayPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as _ from 'lodash';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';
import { DistributionRuleService } from './distribution-rule.service';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';

@ApiTags('Distribution Rule')
@Controller('distribution-rule')
export class DistributionRuleController {
  private static readonly RESOURCE_IDENTIFIER = 'distribution_rule';

  constructor(
    private readonly distributionRuleService: DistributionRuleService,
  ) {}

  @Get()
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: 'Find distribution rules(s) by queue and/or message type.',
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
    name: 'eventType',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of message types.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findAll(
    @Query(
      'queue',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    queues: string[],
    @Query(
      'eventType',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    eventTypes: string[],
  ) {
    const distributionRules = await this.distributionRuleService.findAll(
      queues,
      eventTypes,
    );

    if (_.isEmpty(distributionRules)) {
      throw new NotFoundException('Distribution rules not found!');
    }

    return distributionRules;
  }

  @Get(':id')
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: "Find a distribution rule by it's id.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const distributionRule = await this.distributionRuleService.findOne(id);

    if (!distributionRule) {
      throw new NotFoundException(`Distribution rule for id=${id} not found!`);
    }

    return distributionRule;
  }

  @Post()
  @IamPermission({
    resource: DistributionRuleController.RESOURCE_IDENTIFIER,
    action: 'create',
  })
  @ApiOperation({
    summary: 'Create a distribution rule.',
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
  async create(@Body() createDistributionRuleDto: CreateDistributionRuleDto) {
    try {
      const distributionRule = await this.distributionRuleService.create(
        createDistributionRuleDto,
      );

      return new ApiResponseDto(
        `Successfully created distribution rule for queue=${createDistributionRuleDto.queue} eventType=${createDistributionRuleDto.eventType}!`,
        distributionRule,
      );
    } catch (error) {
      if (error instanceof DefaultRuleException) {
        throw new BadRequestException(error.message);
      }
      throw errorToHttpException(error);
    }
  }

  @Patch(':id')
  @IamPermission({
    resource: DistributionRuleController.RESOURCE_IDENTIFIER,
    action: 'update',
  })
  @ApiOperation({
    summary: 'Update a distribution rule.',
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
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    try {
      const distributionRule = await this.distributionRuleService.update(
        id,
        updateDistributionRuleDto,
      );

      return new ApiResponseDto(
        `Successfully updated distribution rule!`,
        distributionRule,
      );
    } catch (error) {
      if (error instanceof DefaultRuleException) {
        throw new BadRequestException(error.message);
      }
      throw errorToHttpException(error);
    }
  }

  @Delete(':id')
  @IamPermission({
    resource: DistributionRuleController.RESOURCE_IDENTIFIER,
    action: 'remove',
  })
  @ApiOperation({
    summary: 'Remove a distribution rule.',
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
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      await this.distributionRuleService.remove(id);

      return new ApiResponseDto(
        `Successfully deleted distribution rule id=${id}!`,
      );
    } catch (error) {
      if (error instanceof DefaultRuleException) {
        throw new BadRequestException(error.message);
      }
      throw errorToHttpException(error);
    }
  }
}
