import {
  ApiResponseDto,
  Public,
  errorToHttpException
} from '@hermes/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as _ from 'lodash';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate } from './entities/email-template.entity';

@ApiTags('Email Template')
@Controller('email-template')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find email templates.',
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findAll() {
    const emailTemplates = await this.emailTemplateService.findAll();

    if (_.isEmpty(emailTemplates)) {
      throw new NotFoundException(`Email templates not found!`);
    }

    return emailTemplates;
  }

  @Get(':name')
  @Public()
  @ApiOperation({
    summary: "Find an email template by it's name.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  async findOne(@Param('name') name: string) {
    const emailTemplate = await this.emailTemplateService.findOne(name);

    if (!emailTemplate) {
      throw new NotFoundException(`Email Template ${name} not found!`);
    }

    return emailTemplate;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new email template.',
    security: [{ ApiKeyAuth: [] }],
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successful Operation',
    type: ApiResponseDto<EmailTemplate>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid Request',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Resource',
  })
  async create(@Body() createEmailTemplateDto: CreateEmailTemplateDto) {
    try {
      const emailTemplate = await this.emailTemplateService.create(
        createEmailTemplateDto,
      );

      return new ApiResponseDto<EmailTemplate>(
        `Successfully created email template ${emailTemplate.name}!`,
        emailTemplate,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Patch(':name')
  @ApiOperation({
    summary: 'Update an email template.',
    security: [{ ApiKeyAuth: [] }],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful Operation',
    type: ApiResponseDto<EmailTemplate>,
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
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto,
  ) {
    try {
      const emailTemplate = await this.emailTemplateService.update(
        name,
        updateEmailTemplateDto,
      );

      return new ApiResponseDto<EmailTemplate>(
        `Successfully updated email template ${emailTemplate.name}!`,
        emailTemplate,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }

  @Delete(':name')
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
  async remove(@Param('name') name: string) {
    try {
      await this.emailTemplateService.remove(name);
      return new ApiResponseDto(`Successfully deleted email template ${name}!`);
    } catch (error) {
      throw errorToHttpException(error);
    }
  }
}
