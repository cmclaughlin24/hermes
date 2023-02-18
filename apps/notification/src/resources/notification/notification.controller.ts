import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreateRadioNotificationDto } from '../../common/dto/create-radio-notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('email')
  @ApiOperation({
    summary: 'Send an email notification.',
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
    description: 'Forbidden Resource'
  })
  createEmailNotification(
    @Body() createEmailNotificationDto: CreateEmailNotificationDto,
  ) {
    return this.notificationService.createEmailNotification(
      createEmailNotificationDto,
    );
  }

  @Post('sms')
  @ApiOperation({
    summary: 'Send a SMS notification.',
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
    description: 'Forbidden Resource'
  })
  createTextNotification(
    @Body() createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    return this.notificationService.createTextNotification(
      createPhoneNotificationDto,
    );
  }

  @Post('radio')
  @ApiOperation({
    summary: 'Send a radio notification.',
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
    description: 'Forbidden Resource'
  })
  createRadioNotification(
    @Body() createRadioNotification: CreateRadioNotificationDto,
  ) {
    return this.notificationService.createRadioNotification(
      createRadioNotification,
    );
  }
}
