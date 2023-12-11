import { ApiResponseDto, errorToHttpException } from '@hermes/common';
import { Auth, AuthType, IamPermission } from '@hermes/iam';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  private static readonly RESOURCE_IDENTIFIER = 'subscription';

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: 'Find subscriptions.',
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findAll() {
    const subscriptions = await this.subscriptionService.findAll();

    if (_.isEmpty(subscriptions)) {
      throw new NotFoundException('Subscriptions not found!');
    }

    return subscriptions;
  }

  @Get(':eventType/:subscriberId')
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: "Find a subscription by it's distribution event and external id.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findOne(
    @Param('eventType') eventType: string,
    @Param('subscriberId') subscriberId: string,
  ) {
    const subscription = await this.subscriptionService.findOne(
      eventType,
      subscriberId,
    );

    if (!subscription) {
      throw new NotFoundException(
        `Subscription with eventType=${eventType} subscriberId=${subscriberId} not found!`,
      );
    }

    return subscription;
  }

  @Post()
  @IamPermission({
    resource: SubscriptionController.RESOURCE_IDENTIFIER,
    action: 'create',
  })
  @ApiOperation({
    summary: 'Create a subscription.',
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
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    try {
      const subscription = await this.subscriptionService.create(
        createSubscriptionDto,
      );

      return new ApiResponseDto<Subscription>(
        `Successfully created subscription!`,
        subscription,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Patch(':eventType/:subscriberId')
  @IamPermission({
    resource: SubscriptionController.RESOURCE_IDENTIFIER,
    action: 'update',
  })
  @ApiOperation({
    summary: 'Update a subscription.',
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
    @Param('eventType') eventType: string,
    @Param('subscriberId') subscriberId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    try {
      const subscription = await this.subscriptionService.update(
        eventType,
        subscriberId,
        updateSubscriptionDto,
      );

      return new ApiResponseDto<Subscription>(
        `Successfully updated subscription!`,
        subscription,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Delete(':subscriberId')
  @IamPermission({
    resource: SubscriptionController.RESOURCE_IDENTIFIER,
    action: 'remove',
  })
  @ApiOperation({
    summary: 'Remove a subscription from all distribution event(s).',
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
  async removeAll(@Param('subscriberId') subscriberId: string) {
    try {
      await this.subscriptionService.removeAll(subscriberId);

      return new ApiResponseDto(
        `Successfully deleted subscription subscriberId=${subscriberId} from all distribution event(s)!`,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Delete(':eventType/:subscriberId')
  @IamPermission({
    resource: SubscriptionController.RESOURCE_IDENTIFIER,
    action: 'remove',
  })
  @ApiOperation({
    summary: 'Remove a subscription to a distribution event.',
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
    @Param('subscriberId') subscriberId: string,
  ) {
    try {
      await this.subscriptionService.remove(eventType, subscriberId);

      return new ApiResponseDto(
        `Successfully deleted subscription eventType=${eventType} subscriberId=${subscriberId}!`,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }
}
