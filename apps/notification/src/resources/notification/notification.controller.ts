import { ApiResponseDto, errorToHttpException } from '@hermes/common';
import { IamPermission } from '@hermes/iam';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from '../../common/dto/create-push-notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  private static readonly RESOURCE_IDENTIFIER = 'notification';

  constructor(private readonly notificationService: NotificationService) {}

  @Post('email')
  @IamPermission({
    resource: NotificationController.RESOURCE_IDENTIFIER,
    action: 'send_email',
  })
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
    description: 'Forbidden Resource',
  })
  async createEmailNotification(
    @Body() createEmailNotificationDto: CreateEmailNotificationDto,
  ) {
    try {
      const result = await this.notificationService.createEmailNotification(
        createEmailNotificationDto,
      );

      return new ApiResponseDto(
        `Successfully sent email with subject ${createEmailNotificationDto.subject} to ${createEmailNotificationDto.to}`,
        result,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Post('sms')
  @IamPermission({
    resource: NotificationController.RESOURCE_IDENTIFIER,
    action: 'send_sms',
  })
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
    description: 'Forbidden Resource',
  })
  async createTextNotification(
    @Body() createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    try {
      const result = await this.notificationService.createTextNotification(
        createPhoneNotificationDto,
      );

      return new ApiResponseDto(
        `Successfully sent SMS with body ${createPhoneNotificationDto.body} to ${createPhoneNotificationDto.to}`,
        result,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Post('call')
  @IamPermission({
    resource: NotificationController.RESOURCE_IDENTIFIER,
    action: 'send_call',
  })
  @ApiOperation({
    summary: 'Send a call notification.',
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
      const result = await this.notificationService.createCallNotification(
        createPhoneNotificationDto,
      );

      return new ApiResponseDto(
        `Successfully made call with to ${createPhoneNotificationDto.to}`,
        result,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Post('push-notification')
  @IamPermission({
    resource: NotificationController.RESOURCE_IDENTIFIER,
    action: 'send_push',
  })
  @ApiOperation({
    summary: 'Send a push notification.',
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
      const result = await this.notificationService.createPushNotification(
        createPushNotificationDto,
      );

      return new ApiResponseDto(`Successfully sent push notification`, result);
    } catch (error) {
      throw errorToHttpException(error);
    }
  }
}
