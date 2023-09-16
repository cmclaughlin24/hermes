import {
  ApiResponseDto,
  DeliveryMethods,
  errorToHttpException,
} from '@hermes/common';
import { Auth, AuthType } from '@hermes/iam';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Job, JobState } from 'bullmq';
import * as _ from 'lodash';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from '../../common/dto/create-push-notification.dto';
import { NotificationJobService } from './notification-job.service';

@ApiTags('Notification Job')
@Controller('notification-job')
export class NotificationJobController {
  constructor(
    private readonly notificationJobService: NotificationJobService,
  ) {}

  @Get()
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: 'Find jobs on the notification queue by their states.',
    security: [],
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: String,
    isArray: true,
    description: 'A list of job states',
    enum: ['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findAll(
    @Query(
      'state',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    states: JobState[] = [],
  ) {
    const jobs = await this.notificationJobService.findAll(states);

    if (_.isEmpty(jobs)) {
      throw new NotFoundException(
        `Jobs with state(s) ${states.join(', ')} not found`,
      );
    }

    return jobs;
  }

  @Get(':id')
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: "Find a job on the notification queue by it's id.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findOne(@Param('id') id: string) {
    const job = await this.notificationJobService.findOne(id);

    if (!job) {
      throw new NotFoundException(`Job with ${id} not found!`);
    }

    return job;
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
  async createEmailNotification(
    @Body() createEmailNotificationDto: CreateEmailNotificationDto,
  ) {
    try {
      const job = await this.notificationJobService.createEmailNotification(
        createEmailNotificationDto,
      );

      return this._createApiResponseDto(DeliveryMethods.EMAIL, job);
    } catch (error) {
      throw errorToHttpException(error);
    }
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
  async createTextNotification(
    @Body() createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    try {
      const job = await this.notificationJobService.createTextNotification(
        createPhoneNotificationDto,
      );

      return this._createApiResponseDto(DeliveryMethods.SMS, job);
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Post('call')
  @ApiOperation({
    summary: 'Schedule a notification "call" job.',
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
  async createCallNotification(
    @Body() createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    try {
      const job = await this.notificationJobService.createCallNotification(
        createPhoneNotificationDto,
      );

      return this._createApiResponseDto(DeliveryMethods.CALL, job);
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Post('push-notification')
  @ApiOperation({
    summary: 'Schedule a notification "push-notification" job.',
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
  async createPushNotification(
    @Body() createPushNotificationDto: CreatePushNotificationDto,
  ) {
    try {
      const job = await this.notificationJobService.createPushNotification(
        createPushNotificationDto,
      );

      return this._createApiResponseDto(DeliveryMethods.PUSH, job);
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  private _createApiResponseDto(
    name: DeliveryMethods,
    job: Job,
  ): ApiResponseDto<Job> {
    return new ApiResponseDto(
      `Successfully scheduled ${name} notification`,
      job,
    );
  }
}
