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
import {
  ApiResponseDto,
  DistributionQueues,
  Public
} from '@notification/common';
import { DistributionRulesService } from './distribution-rules.service';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';

@ApiTags('Distribution Rule')
@Controller('distribution-rules')
export class DistributionRulesController {
  constructor(
    private readonly distributionRulesService: DistributionRulesService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find distribution rules by their queue.',
    security: [],
  })
  @ApiQuery({
    name: 'queue',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of distribution queues.',
    enum: DistributionQueues
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll(
    @Query(
      'queue',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    queues: DistributionQueues[],
  ) {
    return this.distributionRulesService.findAll(queues);
  }

  @Get(':name')
  @Public()
  @ApiOperation({
    summary: "Find a distribution rule by it's name.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(@Param('name') name: string) {
    return this.distributionRulesService.findOne(name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a distribution rule',
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
    return this.distributionRulesService.create(createDistributionRuleDto);
  }

  @Patch(':name')
  @ApiOperation({
    summary: 'Update a distribution rule',
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
    @Param('name') name: string,
    @Body() updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    return this.distributionRulesService.update(
      name,
      updateDistributionRuleDto,
    );
  }

  @Delete(':name')
  @ApiOperation({
    summary: 'Remove a distribution rule',
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
  remove(@Param('name') name: string) {
    return this.distributionRulesService.remove(name);
  }
}
