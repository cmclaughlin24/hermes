import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto, DeliveryMethods } from '@notification/common';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helpers';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { PhoneTemplate } from './entities/phone-template.entity';
import { PhoneTemplateService } from './phone-template.service';

describe('PhoneTemplateService', () => {
  let service: PhoneTemplateService;
  let phoneTemplateModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneTemplateService,
        {
          provide: getModelToken(PhoneTemplate),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<PhoneTemplateService>(PhoneTemplateService);
    phoneTemplateModel = module.get<MockRepository>(
      getModelToken(PhoneTemplate),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    const phoneTemplate = {
      name: 'unit-test',
      deliveryMethod: DeliveryMethods.SMS,
      template: '<Response><Say>Hello There!</Say></Response>',
    } as PhoneTemplate;

    afterEach(() => {
      phoneTemplateModel.findAll.mockClear();
    });

    it('should yield a list of phone templates', async () => {
      // Arrange.
      const expectedResult = [phoneTemplate];
      phoneTemplateModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield a "NotFoundException" if the repository yields null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Phone templates not found!',
      );
      phoneTemplateModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll()).rejects.toEqual(expectedResult);
    });

    it('should yield a "NotFoundException" if the repository yields an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Phone templates not found!',
      );
      phoneTemplateModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    const phoneTemplate = {
      name: 'unit-test',
      deliveryMethod: DeliveryMethods.SMS,
      template: '<Response><Say>Hello There!</Say></Response>',
    } as PhoneTemplate;

    afterEach(() => {
      phoneTemplateModel.findOne.mockClear();
    });

    it('should yield a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOne.mockResolvedValue(phoneTemplate);

      // Act/Assert.
      await expect(
        service.findOne(phoneTemplate.deliveryMethod, phoneTemplate.name),
      ).resolves.toEqual(phoneTemplate);
    });

    it('should throw a "NotFoundException" if the repository yields null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Phone template name=${phoneTemplate.name} for deliveryMethod=${phoneTemplate.deliveryMethod} not found!`,
      );
      phoneTemplateModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.findOne(phoneTemplate.deliveryMethod, phoneTemplate.name),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    const createPhoneTemplateDto: CreatePhoneTemplateDto = {
      name: 'unit-test',
      deliveryMethod: DeliveryMethods.SMS,
      template: '<Response><Say>Hello There!</Say></Response>',
      context: null,
    };
    const phoneTemplate = { ...createPhoneTemplateDto } as PhoneTemplate;

    afterEach(() => {
      phoneTemplateModel.create.mockClear();
    });

    it('should create a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOne.mockResolvedValue(null);
      phoneTemplateModel.create.mockResolvedValue(phoneTemplate);

      // Act.
      await service.create(createPhoneTemplateDto);

      // Assert.
      expect(phoneTemplateModel.create).toHaveBeenCalled();
    });

    it('should yield an "ApiResponseDto" object with the created phone template', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully created phone template ${phoneTemplate.name}!`,
        phoneTemplate,
      );
      phoneTemplateModel.findOne.mockResolvedValue(null);
      phoneTemplateModel.create.mockResolvedValue(phoneTemplate);

      // Assert.
      await expect(service.create(createPhoneTemplateDto)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "BadRequestException" if the phone template already exits', async () => {
      // Arrange.
      const expectedResult = new BadRequestException(
        `Phone template name=${createPhoneTemplateDto.name} for deliveryMethod=${createPhoneTemplateDto.deliveryMethod} already exists!`,
      );
      phoneTemplateModel.findOne.mockResolvedValue({
        name: 'test',
      } as PhoneTemplate);

      // Act/Assert.
      await expect(service.create(createPhoneTemplateDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const phoneTemplate = { update: jest.fn() };

    afterEach(() => {
      phoneTemplate.update.mockClear();
    });

    it('should update a phone template', async () => {});

    it('should yield an "ApiResponseDto" object with the updated phone template', async () => {});

    it('should throw a "NotFoundException" if the phone template does not exist', async () => {});
  });

  describe('remove()', () => {
    const phoneTemplate = { destroy: jest.fn() };

    afterEach(() => {
      phoneTemplate.destroy.mockClear();
    });

    it('should remove a phone template', async () => {});

    it('should yield an "ApiResponseDto" object', async () => {});

    it('should throw a "NotFoundException" if the phone template does not exist', async () => {});
  });
});
