import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<Type> {
  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: Type;

  constructor(message: string, data?: any) {
    this.message = message;
    this.data = data;
  }
}
