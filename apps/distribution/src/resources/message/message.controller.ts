import { ApiResponseDto, errorToHttpException } from '@hermes/common';
import { IamPermission } from '@hermes/iam';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';

@ApiTags('Message')
@Controller('message')
export class MessageController {
  private static readonly RESOURCE_IDENTIFIER = 'distribution_message';

  constructor(private readonly messageService: MessageService) {}

  @Post()
  @IamPermission({
    resource: MessageController.RESOURCE_IDENTIFIER,
    action: 'publish',
  })
  @ApiOperation({
    summary: 'Publish a message to an exchange.',
    security: [{ ApiKeyAuth: [] }, { Authorization: [] }],
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
  async create(@Body() createMessageDto: CreateMessageDto) {
    try {
      await this.messageService.create(createMessageDto);

      return new ApiResponseDto(
        `Successfully sent message to ${createMessageDto.exchange}!`,
      );
    } catch (error) {
      throw errorToHttpException(error);
    }
  }
}
