import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto, Public } from '@notification/common';
import { JobState } from 'bullmq';
import { DistributionJobService } from './distribution-job.service';
import { CreateDistributionJobDto } from './dto/create-distribution-job.dto';

@ApiTags('Distribution Job')
@Controller('distribution-job')
export class DistributionJobController {
  constructor(
    private readonly distributionJobService: DistributionJobService,
  ) {}

  @Get('default')
  @Public()
  @ApiOperation({
    summary: 'Find jobs on the distribution_default queue by their states.',
    security: [],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of job states',
    enum: ['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findDefaultDistributionJobs(
    @Query(
      'state',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    states: JobState[] = [],
  ) {
    return this.distributionJobService.findDefaultDistributionJobs(states);
  }

  @Get('default/:id')
  @Public()
  @ApiOperation({
    summary: "Find a job on the distribution_default queue by it's id.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findDefaultDistributionJob(@Param('id') id: string) {
    return this.distributionJobService.findDefaultDistributionJob(id);
  }

  @Post('default')
  @ApiOperation({
    summary: 'Schedule a job on the distribution_default queue.',
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
  createDefaultDistributionJob(
    @Body() createDefaultDistributionJob: CreateDistributionJobDto,
  ) {
    return this.distributionJobService.createDefaultDistributionJob(
      createDefaultDistributionJob,
    );
  }
}
