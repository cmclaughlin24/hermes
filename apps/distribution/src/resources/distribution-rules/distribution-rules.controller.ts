import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto, Public } from '@notification/common';
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
    security: [],
  })
  findAll() {
    return this.distributionRulesService.findAll();
  }

  @Get(':name')
  @Public()
  @ApiOperation({
    security: [],
  })
  findOne(@Param('name') name: string) {
    return this.distributionRulesService.findOne(name);
  }

  @Post()
  @ApiOperation({
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
