import {
  DeliveryMethods,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import { createCacheStoreMock } from '../../../test/helpers/provider.helper';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';
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
        {
          provide: CACHE_MANAGER,
          useValue: createCacheStoreMock(),
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

    it('should yield an empty list if the repository yields an empty list', async () => {
      // Arrange.
      phoneTemplateModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).resolves.toHaveLength(0);
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

    it('should yield null if the repository yields null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Phone template name=${phoneTemplate.name} for deliveryMethod=${phoneTemplate.deliveryMethod} not found!`,
      );
      phoneTemplateModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.findOne(phoneTemplate.deliveryMethod, phoneTemplate.name),
      ).resolves.toBeNull();
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

    it('should yield the created phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOne.mockResolvedValue(null);
      phoneTemplateModel.create.mockResolvedValue(phoneTemplate);

      // Assert.
      await expect(service.create(createPhoneTemplateDto)).resolves.toEqual(
        phoneTemplate,
      );
    });

    it('should throw a "ExistsException" if the phone template already exits', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
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
    const updatePhoneTemplateDto: UpdatePhoneTemplateDto = {
      template: '<Response><Say>Hello There!</Say></Response>',
      context: null,
    };
    const phoneTemplate = { name: 'unit-test', update: jest.fn() };

    afterEach(() => {
      phoneTemplate.update.mockClear();
    });

    it('should update a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOne.mockResolvedValue(phoneTemplate);
      phoneTemplate.update.mockResolvedValue(phoneTemplate);

      // Act.
      await service.update(DeliveryMethods.CALL, '', updatePhoneTemplateDto);

      // Assert.
      expect(phoneTemplate.update).toHaveBeenCalledWith(updatePhoneTemplateDto);
    });

    it('should yield the updated phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOne.mockResolvedValue(phoneTemplate);
      phoneTemplate.update.mockResolvedValue(phoneTemplate);

      // Act/Assert.
      await expect(
        service.update(DeliveryMethods.CALL, '', updatePhoneTemplateDto),
      ).resolves.toEqual(phoneTemplate);
    });

    it('should throw a "MissingException" if the phone template does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Phone template name=${phoneTemplate.name} for deliveryMethod=${DeliveryMethods.CALL} not found!`,
      );
      phoneTemplateModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.update(
          DeliveryMethods.CALL,
          phoneTemplate.name,
          updatePhoneTemplateDto,
        ),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const phoneTemplate = { name: 'unit-test', destroy: jest.fn() };

    afterEach(() => {
      phoneTemplate.destroy.mockClear();
    });

    it('should remove a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOne.mockResolvedValue(phoneTemplate);

      // Act.
      await service.remove(DeliveryMethods.SMS, '');

      // Assert.
      expect(phoneTemplate.destroy).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the phone template does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Phone template name=${phoneTemplate.name} for deliveryMethod=${DeliveryMethods.SMS} not found!`,
      );
      phoneTemplateModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.remove(DeliveryMethods.SMS, phoneTemplate.name),
      ).rejects.toEqual(expectedResult);
    });
  });
});
