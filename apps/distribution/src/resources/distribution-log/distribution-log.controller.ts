import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll() {
    return this.distributionLogService.findAll();
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
