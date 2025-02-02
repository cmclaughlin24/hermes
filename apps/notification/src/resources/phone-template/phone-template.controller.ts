import {
  ApiResponseDto,
  PhoneMethods,
  errorToHttpException,
} from '@hermes/common';
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
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';
import { PhoneTemplateService } from './phone-template.service';
import { PhoneTemplate } from './repository/entities/phone-template.entity';

@ApiTags('Phone Template')
@Controller('phone-template')
export class PhoneTemplateController {
  private static readonly RESOURCE_IDENTIFIER = 'phone_template'

  constructor(private readonly phoneTemplateService: PhoneTemplateService) {}

  @Get()
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: 'Find phone templates.',
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findAll() {
    const phoneTemplates = await this.phoneTemplateService.findAll();

    if (_.isEmpty(phoneTemplates)) {
      throw new NotFoundException('Phone templates not found!');
    }

    return phoneTemplates;
  }

  @Get(':deliveryMethod/:name')
  @Auth(AuthType.NONE)
  @ApiOperation({
    summary: "Find a phone template by it's name.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findOne(
    @Param('deliveryMethod') deliveryMethod: PhoneMethods,
    @Param('name') name: string,
  ) {
    const phoneTemplate = await this.phoneTemplateService.findOne(
      deliveryMethod,
      name,
    );

    if (!phoneTemplate) {
      throw new NotFoundException(
        `Phone template name=${name} for deliveryMethod=${deliveryMethod} not found!`,
      );
    }

    return phoneTemplate;
  }

  @Post()
  @IamPermission({
    resource: PhoneTemplateController.RESOURCE_IDENTIFIER,
    action: 'create',
  })
  @ApiOperation({
    summary: 'Create a new phone template.',
    security: [{ ApiKeyAuth: [] }, { Authorization: [] }],
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successful Operation',
    type: ApiResponseDto<PhoneTemplate>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid Request',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Resource',
  })
  async create(@Body() createPhoneTemplateDto: CreatePhoneTemplateDto) {
    try {
      const phoneTemplate = await this.phoneTemplateService.create(
        createPhoneTemplateDto,
      );

      return new ApiResponseDto<PhoneTemplate>(
        `Successfully created phone template ${phoneTemplate.name}!`,
        phoneTemplate,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Patch(':deliveryMethod/:name')
  @IamPermission({
    resource: PhoneTemplateController.RESOURCE_IDENTIFIER,
    action: 'update',
  })
  @ApiOperation({
    summary: 'Update a phone template.',
    security: [{ ApiKeyAuth: [] }, { Authorization: [] }],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful Operation',
    type: ApiResponseDto<PhoneTemplate>,
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
    @Param('deliveryMethod') deliveryMethod: PhoneMethods,
    @Param('name') name: string,
    @Body() updatePhoneTemplateDto: UpdatePhoneTemplateDto,
  ) {
    try {
      const phoneTemplate = await this.phoneTemplateService.update(
        deliveryMethod,
        name,
        updatePhoneTemplateDto,
      );

      return new ApiResponseDto<PhoneTemplate>(
        `Successfully updated phone template ${phoneTemplate.name}!`,
        phoneTemplate,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Delete(':deliveryMethod/:name')
  @IamPermission({
    resource: PhoneTemplateController.RESOURCE_IDENTIFIER,
    action: 'remove',
  })
  @ApiOperation({
    summary: 'Remove an email template.',
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
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async remove(
    @Param('deliveryMethod') deliveryMethod: PhoneMethods,
    @Param('name') name: string,
  ) {
    try {
      await this.phoneTemplateService.remove(deliveryMethod, name);
      return new ApiResponseDto(`Successfully deleted phone template ${name}!`);
    } catch (error) {
      throw errorToHttpException(error);
    }
  }
}
