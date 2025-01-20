import {
  DeliveryMethods,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { createCacheStoreMock } from '../../../test/helpers/provider.helper';
import { CreatePhoneTemplateDto } from './dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from './dto/update-phone-template.dto';
import { PhoneTemplate } from './repository/entities/phone-template.entity';
import { PhoneTemplateService } from './phone-template.service';
import { PhoneTemplateRepository } from './repository/phone-template.repository';

type MockPhoneTemplateRepository = Partial<
  Record<keyof PhoneTemplateRepository, jest.Mock>
>;

const createPhoneTemplateRepositoryMock = (): MockPhoneTemplateRepository => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('PhoneTemplateService', () => {
  let service: PhoneTemplateService;
  let phoneTemplateRepository: MockPhoneTemplateRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneTemplateService,
        {
          provide: PhoneTemplateRepository,
          useValue: createPhoneTemplateRepositoryMock(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: createCacheStoreMock(),
        },
      ],
    }).compile();

    service = module.get<PhoneTemplateService>(PhoneTemplateService);
    phoneTemplateRepository = module.get<MockPhoneTemplateRepository>(
      PhoneTemplateRepository,
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
      phoneTemplateRepository.findAll.mockClear();
    });

    it('should yield a list of phone templates', async () => {
      // Arrange.
      const expectedResult = [phoneTemplate];
      phoneTemplateRepository.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository yields an empty list', async () => {
      // Arrange.
      phoneTemplateRepository.findAll.mockResolvedValue([]);

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
      phoneTemplateRepository.findOne.mockClear();
    });

    it('should yield a phone template', async () => {
      // Arrange.
      phoneTemplateRepository.findOne.mockResolvedValue(phoneTemplate);

      // Act/Assert.
      await expect(
        service.findOne(phoneTemplate.deliveryMethod, phoneTemplate.name),
      ).resolves.toEqual(phoneTemplate);
    });

    it('should yield null if the repository yields null/undefined', async () => {
      // Arrange.
      phoneTemplateRepository.findOne.mockResolvedValue(null);

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
      phoneTemplateRepository.create.mockClear();
    });

    it('should create a phone template', async () => {
      // Arrange.
      phoneTemplateRepository.create.mockResolvedValue(phoneTemplate);

      // Act.
      await service.create(createPhoneTemplateDto);

      // Assert.
      expect(phoneTemplateRepository.create).toHaveBeenCalled();
    });

    it('should yield the created phone template', async () => {
      // Arrange.
      phoneTemplateRepository.create.mockResolvedValue(phoneTemplate);

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
      phoneTemplateRepository.create.mockRejectedValue(expectedResult);

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
      phoneTemplateRepository.update.mockClear();
    });

    it('should update a phone template', async () => {
      // Arrange.
      phoneTemplateRepository.update.mockResolvedValue(phoneTemplate);

      // Act.
      await service.update(DeliveryMethods.CALL, '', updatePhoneTemplateDto);

      // Assert.
      expect(phoneTemplateRepository.update).toHaveBeenCalledWith(
        DeliveryMethods.CALL,
        '',
        {
          ...updatePhoneTemplateDto,
        },
      );
    });

    it('should yield the updated phone template', async () => {
      // Arrange.
      phoneTemplateRepository.update.mockResolvedValue(phoneTemplate);

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
      phoneTemplateRepository.update.mockRejectedValue(expectedResult);

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
      phoneTemplateRepository.remove.mockClear();
    });

    it('should remove a phone template', async () => {
      // Arrange.
      phoneTemplateRepository.remove.mockResolvedValue(phoneTemplate);

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
      phoneTemplateRepository.remove.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.remove(DeliveryMethods.SMS, phoneTemplate.name),
      ).rejects.toEqual(expectedResult);
    });
  });
});
