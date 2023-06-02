import { ApiResponseDto, Public } from '@hermes/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePushNotificationDto } from '../../common/dto/create-push-notification.dto';
import { UpdatePushTemplateDto } from './dto/update-push-template.dto';
import { PushTemplate } from './entities/push-template.entity';
import { PushTemplateService } from './push-template.service';

@ApiTags('Push Template')
@Controller('push-template')
export class PushTemplateController {
  constructor(private readonly pushTemplateService: PushTemplateService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find push notification templates.',
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll() {
    return this.pushTemplateService.findAll();
  }

  @Get(':name')
  @Public()
  @ApiOperation({
    summary: "Find a push notification template by it's name.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(@Param('name') name: string) {
    return this.pushTemplateService.findOne(name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new push notification template.',
    security: [{ ApiKeyAuth: [] }],
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
  create(@Body() createPushTemplateDto: CreatePushNotificationDto) {
    return this.pushTemplateService.create(createPushTemplateDto);
  }

  @Patch(':name')
  @ApiOperation({
    summary: 'Update a push notification template.',
    security: [{ ApiKeyAuth: [] }],
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
  update(
    @Param('name') name: string,
    @Body() updatePushTemplateDto: UpdatePushTemplateDto,
  ) {
    return this.pushTemplateService.update(name, updatePushTemplateDto);
  }

  @Delete(':name')
  @ApiOperation({
    summary: 'Remove a push notification template.',
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
  remove(@Param('name') name: string) {
    return this.pushTemplateService.remove(name);
  }
}
