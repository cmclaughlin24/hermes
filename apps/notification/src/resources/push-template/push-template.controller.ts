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
import { CreatePushTemplateDto } from './dto/create-push-template.dto';
import { UpdatePushTemplateDto } from './dto/update-push-template.dto';
import { PushTemplateService } from './push-template.service';
import { PushTemplate } from './repository/entities/push-template.entity';

@ApiTags('Push Template')
@Controller('push-template')
export class PushTemplateController {
  private static readonly RESOURCE_IDENTIFIER = 'push_template';

  constructor(private readonly pushTemplateService: PushTemplateService) {}

  @Get()
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: 'Find push notification templates.',
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findAll() {
    const pushTemplates = await this.pushTemplateService.findAll();

    if (_.isEmpty(pushTemplates)) {
      throw new NotFoundException('Push Notification templates not found!');
    }

    return pushTemplates;
  }

  @Get(':name')
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: "Find a push notification template by it's name.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findOne(@Param('name') name: string) {
    const pushTemplate = await this.pushTemplateService.findOne(name);

    if (!pushTemplate) {
      throw new NotFoundException(
        `Push Notification Template with ${name} not found!`,
      );
    }

    return pushTemplate;
  }

  @Post()
  @IamPermission({
    resource: PushTemplateController.RESOURCE_IDENTIFIER,
    action: 'create',
  })
  @ApiOperation({
    summary: 'Create a new push notification template.',
    security: [{ ApiKeyAuth: [] }, { Authorization: [] }],
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successful Operation',
    type: ApiResponseDto<PushTemplate>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid Request',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Resource',
  })
  async create(@Body() createPushTemplateDto: CreatePushTemplateDto) {
    try {
      const pushTemplate = await this.pushTemplateService.create(
        createPushTemplateDto,
      );

      return new ApiResponseDto<PushTemplate>(
        `Successfully created push notification template ${pushTemplate.name}!`,
        pushTemplate,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Patch(':name')
  @IamPermission({
    resource: PushTemplateController.RESOURCE_IDENTIFIER,
    action: 'update',
  })
  @ApiOperation({
    summary: 'Update a push notification template.',
    security: [{ ApiKeyAuth: [] }, { Authorization: [] }],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful Operation',
    type: ApiResponseDto<PushTemplate>,
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
  async update(
    @Param('name') name: string,
    @Body() updatePushTemplateDto: UpdatePushTemplateDto,
  ) {
    try {
      const pushTemplate = await this.pushTemplateService.update(
        name,
        updatePushTemplateDto,
      );

      return new ApiResponseDto<PushTemplate>(
        `Successfully updated push notification template ${pushTemplate.name}!`,
        pushTemplate,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Delete(':name')
  @IamPermission({
    resource: PushTemplateController.RESOURCE_IDENTIFIER,
    action: 'remove',
  })
  @ApiOperation({
    summary: 'Remove a push notification template.',
    security: [{ ApiKeyAuth: [] }, { Authorization: [] }],
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
  async remove(@Param('name') name: string) {
    try {
      await this.pushTemplateService.remove(name);

      return new ApiResponseDto(
        `Successfully deleted push notification template ${name}!`,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }
}
