import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { EmailTemplateService } from './email-template.service';

@ApiTags('Email Template')
@Controller('email-template')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Find an email templates.',
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll() {
    return this.emailTemplateService.findAll();
  }

  @Get(':name')
  @Public()
  @ApiOperation({
    summary: "Find an email template by it's name.",
    security: [],
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(@Param('name') name: string) {
    return this.emailTemplateService.findOne(name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new email template.',
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
  create(@Body() createEmailTemplateDto: any) {
    return this.create(createEmailTemplateDto);
  }

  @Patch(':name')
  @ApiOperation({
    summary: 'Update an email template.',
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
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  update(@Param('name') name: string, @Body() updateEmailTemplateDto: any) {
    return this.emailTemplateService.update(name, updateEmailTemplateDto);
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
  remove(@Param('name') name: string) {
    return this.remove(name);
  }
}
