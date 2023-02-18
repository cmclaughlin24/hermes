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
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { EmailTemplateService } from './email-template.service';

@ApiTags('Email Template')
@Controller('email-template')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findAll() {
    return this.emailTemplateService.findAll();
  }

  @Get(':name')
  @ApiOperation({
    summary: "Find an email template by it's name.",
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Operation' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  findOne(@Param('name') name: string) {
    return this.emailTemplateService.findOne(name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new email template.',
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
  create(@Body() createEmailTemplateDto: any) {
    return this.create(createEmailTemplateDto);
  }

  @Patch(':name')
  @ApiOperation({
    summary: 'Update an email template.',
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
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  update(@Param('name') name: string, @Body() updateEmailTemplateDto: any) {
    return this.emailTemplateService.update(name, updateEmailTemplateDto);
  }

  @Delete(':name')
  @ApiOperation({
    summary: 'Remove an email template.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful Operation',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  remove(@Param('name') name: string) {
    return this.remove(name);
  }
}
