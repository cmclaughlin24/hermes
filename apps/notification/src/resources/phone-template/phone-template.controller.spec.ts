import { ApiResponseDto, DeliveryMethods } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
    MockPhoneTemplateService,
    createPhoneTemplateServiceMock,
} from '../../../test/helpers/provider.helper';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { PhoneTemplate } from './entities/phone-template.entity';
import { PhoneTemplateController } from './phone-template.controller';
import { PhoneTemplateService } from './phone-template.service';

describe('PhoneTemplateController', () => {
  let controller: PhoneTemplateController;
  let service: MockPhoneTemplateService;

  const phoneTemplate = {
    name: 'unit-test',
    deliveryMethod: DeliveryMethods.SMS,
    template: '<Response><Say>Hello There!</Say></Response>',
  } as PhoneTemplate;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhoneTemplateController],
      providers: [
        {
          provide: PhoneTemplateService,
          useValue: createPhoneTemplateServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<PhoneTemplateController>(PhoneTemplateController);
    service = module.get<MockPhoneTemplateService>(PhoneTemplateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should yield a list of phone templates', async () => {
      // Arrange.
      const expectedResult = [phoneTemplate];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll()).resolves.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    it('should yield a phone template', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(phoneTemplate);

      // Act/Assert.
      await expect(
        controller.findOne(DeliveryMethods.SMS, phoneTemplate.name),
      ).resolves.toEqual(phoneTemplate);
    });
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully created phone template ${phoneTemplate.name}!`,
        phoneTemplate,
      );
      service.create.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.create({} as CreatePhoneTemplateDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully updated phone template ${phoneTemplate.name}!`,
        phoneTemplate,
      );
      service.update.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.update(
          DeliveryMethods.CALL,
          phoneTemplate.name,
          {} as CreatePhoneTemplateDto,
        ),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted phone template ${phoneTemplate.name}!`,
      );
      service.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.remove(DeliveryMethods.CALL, phoneTemplate.name),
      ).resolves.toEqual(expectedResult);
    });
  });
});
