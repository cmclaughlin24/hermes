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
import { JobStatus } from 'bull';
import { Public } from '../../common/decorators/public.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreateRadioNotificationDto } from '../../common/dto/create-radio-notification.dto';
import { NotificationJobService } from './notification-job.service';

@ApiTags('Notification Job')
@Controller('notification-job')
export class NotificationJobController {
  constructor(
    private readonly notificationJobService: NotificationJobService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find jobs on the notification queue by their status.',
    security: [],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'A comma seperated list of job statuses',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll(
    @Query(
      'status',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    statuses: JobStatus[] = [],
  ) {
    return this.notificationJobService.findAll(statuses);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: "Find a job on the notification queue by it's id.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(@Param('id') id: number) {
    return this.notificationJobService.findOne(id);
  }

  @Post('email')
  @ApiOperation({
    summary: 'Schedule a notification "email" job.',
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
  createEmailNotification(
    @Body() createEmailNotificationDto: CreateEmailNotificationDto,
  ) {
    return this.notificationJobService.createEmailNotification(
      createEmailNotificationDto,
    );
  }

  @Post('sms')
  @ApiOperation({
    summary: 'Schedule a notification "sms" job.',
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
  createTextNotification(
    @Body() createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    return this.notificationJobService.createTextNotification(
      createPhoneNotificationDto,
    );
  }

  @Post('radio')
  @ApiOperation({
    summary: 'Schedule a notification "radio" job.',
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
  createRadioNotification(
    @Body() createRadioNotification: CreateRadioNotificationDto,
  ) {
    return this.notificationJobService.createRadioNotification(
      createRadioNotification,
    );
  }
}
