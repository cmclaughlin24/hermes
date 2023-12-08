import {
  DeliveryMethods,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
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
  let phoneTemplateRepository: MockRepository;

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
    phoneTemplateRepository = module.get<MockRepository>(
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
      phoneTemplateRepository.find.mockClear();
    });

    it('should yield a list of phone templates', async () => {
      // Arrange.
      const expectedResult = [phoneTemplate];
      phoneTemplateRepository.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository yields an empty list', async () => {
      // Arrange.
      phoneTemplateRepository.find.mockResolvedValue([]);

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
      phoneTemplateRepository.findOneBy.mockClear();
    });

    it('should yield a phone template', async () => {
      // Arrange.
      phoneTemplateRepository.findOneBy.mockResolvedValue(phoneTemplate);

      // Act/Assert.
      await expect(
        service.findOne(phoneTemplate.deliveryMethod, phoneTemplate.name),
      ).resolves.toEqual(phoneTemplate);
    });

    it('should yield null if the repository yields null/undefined', async () => {
      // Arrange.
      phoneTemplateRepository.findOneBy.mockResolvedValue(null);

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
      phoneTemplateRepository.findOneBy.mockClear();
      phoneTemplateRepository.create.mockClear();
      phoneTemplateRepository.save.mockClear();
    });

    it('should create a phone template', async () => {
      // Arrange.
      phoneTemplateRepository.findOneBy.mockResolvedValue(null);
      phoneTemplateRepository.create.mockResolvedValue(phoneTemplate);

      // Act.
      await service.create(createPhoneTemplateDto);

      // Assert.
      expect(phoneTemplateRepository.create).toHaveBeenCalled();
    });

    it('should yield the created phone template', async () => {
      // Arrange.
      phoneTemplateRepository.findOneBy.mockResolvedValue(null);
      phoneTemplateRepository.create.mockResolvedValue(phoneTemplate);
      phoneTemplateRepository.save.mockResolvedValue(phoneTemplate);

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
      phoneTemplateRepository.findOneBy.mockResolvedValue({
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
    const phoneTemplate = { name: 'unit-test' };

    afterEach(() => {
      phoneTemplateRepository.preload.mockClear();
      phoneTemplateRepository.save.mockClear();
    });

    it('should update a phone template', async () => {
      // Arrange.
      phoneTemplateRepository.findOne.mockResolvedValue(phoneTemplate);
      phoneTemplateRepository.preload.mockResolvedValue(phoneTemplate);

      // Act.
      await service.update(DeliveryMethods.CALL, '', updatePhoneTemplateDto);

      // Assert.
      expect(phoneTemplateRepository.preload).toHaveBeenCalledWith({
        name: '',
        deliveryMethod: DeliveryMethods.CALL,
        ...updatePhoneTemplateDto,
      });
    });

    it('should yield the updated phone template', async () => {
      // Arrange.
      phoneTemplateRepository.findOne.mockResolvedValue(phoneTemplate);
      phoneTemplateRepository.preload.mockResolvedValue(phoneTemplate);
      phoneTemplateRepository.save.mockResolvedValue(phoneTemplate);

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
      phoneTemplateRepository.findOne.mockResolvedValue(null);

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
    const phoneTemplate = { name: 'unit-test' };

    afterEach(() => {
      phoneTemplateRepository.findOneBy.mockClear();
      phoneTemplateRepository.remove.mockClear();
    });

    it('should remove a phone template', async () => {
      // Arrange.
      phoneTemplateRepository.findOneBy.mockResolvedValue(phoneTemplate);

      // Act.
      await service.remove(DeliveryMethods.SMS, '');

      // Assert.
      expect(phoneTemplateRepository.remove).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the phone template does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Phone template name=${phoneTemplate.name} for deliveryMethod=${DeliveryMethods.SMS} not found!`,
      );
      phoneTemplateRepository.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.remove(DeliveryMethods.SMS, phoneTemplate.name),
      ).rejects.toEqual(expectedResult);
    });
  });
});
