import { ApiResponseDto, PhoneMethods, Public } from '@hermes/common';
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
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';
import { PhoneTemplate } from './entities/phone-template.entity';
import { PhoneTemplateService } from './phone-template.service';

@ApiTags('Phone Template')
@Controller('phone-template')
export class PhoneTemplateController {
  constructor(private readonly phoneTemplateService: PhoneTemplateService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find phone templates.',
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll() {
    return this.phoneTemplateService.findAll();
  }

  @Get(':deliveryMethod/:name')
  @Public()
  @ApiOperation({
    summary: "Find a phone template by it's name.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(
    @Param('deliveryMethod') deliveryMethod: PhoneMethods,
    @Param('name') name: string,
  ) {
    return this.phoneTemplateService.findOne(deliveryMethod, name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new phone template.',
    security: [{ ApiKeyAuth: [] }],
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
  create(@Body() createPhoneTemplateDto: CreatePhoneTemplateDto) {
    return this.phoneTemplateService.create(createPhoneTemplateDto);
  }

  @Patch(':deliveryMethod/:name')
  @ApiOperation({
    summary: 'Update a phone template.',
    security: [{ ApiKeyAuth: [] }],
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
  update(
    @Param('deliveryMethod') deliveryMethod: PhoneMethods,
    @Param('name') name: string,
    @Body() updatePhoneTemplateDto: UpdatePhoneTemplateDto,
  ) {
    return this.phoneTemplateService.update(
      deliveryMethod,
      name,
      updatePhoneTemplateDto,
    );
  }

  @Delete(':deliveryMethod/:name')
  @ApiOperation({
    summary: 'Remove an email template.',
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
  remove(
    @Param('deliveryMethod') deliveryMethod: PhoneMethods,
    @Param('name') name: string,
  ) {
    return this.phoneTemplateService.remove(deliveryMethod, name);
  }
}
