import {
  ApiResponseDto,
  DeliveryMethods,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockPhoneTemplateService,
  createPhoneTemplateServiceMock,
} from '../../../test/helpers/provider.helper';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';
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

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Phone templates not found!',
      );
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findAll()).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Phone templates not found!',
      );
      service.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(controller.findAll()).rejects.toEqual(expectedResult);
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

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Phone template name=${phoneTemplate.name} for deliveryMethod=${DeliveryMethods.SMS} not found!`,
      );
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        controller.findOne(DeliveryMethods.SMS, phoneTemplate.name),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully created phone template ${phoneTemplate.name}!`,
        phoneTemplate,
      );
      service.create.mockResolvedValue(phoneTemplate);

      // Act/Assert.
      await expect(
        controller.create({} as CreatePhoneTemplateDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "BadRequestException" if a phone template already exists', async () => {
      // Arrange.
      const errorMessage = `Phone template name=${phoneTemplate.name} for deliveryMethod=${phoneTemplate.deliveryMethod} already exists!`;
      const expectedResult = new BadRequestException(errorMessage);
      service.create.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(
        controller.create({} as CreatePhoneTemplateDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully updated phone template ${phoneTemplate.name}!`,
        phoneTemplate,
      );
      service.update.mockResolvedValue(phoneTemplate);

      // Act/Assert.
      await expect(
        controller.update(
          DeliveryMethods.CALL,
          phoneTemplate.name,
          {} as UpdatePhoneTemplateDto,
        ),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if a phone template does not exist', async () => {
      // Arrange.
      const errorMessage = `Phone template name=${phoneTemplate.name} for deliveryMethod=${DeliveryMethods.SMS} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.update.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.update(
          DeliveryMethods.SMS,
          phoneTemplate.name,
          {} as UpdatePhoneTemplateDto,
        ),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted phone template ${phoneTemplate.name}!`,
      );
      service.remove.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        controller.remove(DeliveryMethods.CALL, phoneTemplate.name),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if a phone template does not exist', async () => {
      // Arrange.
      const errorMessage = `Phone template name=${phoneTemplate.name} for deliveryMethod=${DeliveryMethods.SMS} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.remove.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.remove(DeliveryMethods.SMS, phoneTemplate.name),
      ).rejects.toEqual(expectedResult);
    });
  });
});
