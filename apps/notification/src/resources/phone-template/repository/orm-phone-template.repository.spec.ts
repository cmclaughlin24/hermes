import {
  DeliveryMethods,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  createMockRepository,
} from '../../../../test/helpers/database.helper';
import { CreatePhoneTemplateDto } from '../../../resources/phone-template/dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from '../../../resources/phone-template/dto/update-phone-template.dto';
import { PhoneTemplate } from './entities/phone-template.entity';
import { OrmPhoneTemplateRepository } from './orm-phone-template.repository';

describe('OrmPhoneTemplateRepository', () => {
  let repository: OrmPhoneTemplateRepository;
  let phoneTemplateModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrmPhoneTemplateRepository,
        {
          provide: getRepositoryToken(PhoneTemplate),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    repository = module.get<OrmPhoneTemplateRepository>(
      OrmPhoneTemplateRepository,
    );
    phoneTemplateModel = module.get<MockRepository>(
      getRepositoryToken(PhoneTemplate),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    const phoneTemplate = {
      name: 'unit-test',
      deliveryMethod: DeliveryMethods.SMS,
      template: '<Response><Say>Hello There!</Say></Response>',
    } as PhoneTemplate;

    afterEach(() => {
      phoneTemplateModel.find.mockClear();
    });

    it('should yield a list of phone templates', async () => {
      // Arrange.
      const expectedResult = [phoneTemplate];
      phoneTemplateModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository yields an empty list', async () => {
      // Arrange.
      phoneTemplateModel.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    const phoneTemplate = {
      name: 'unit-test',
      deliveryMethod: DeliveryMethods.SMS,
      template: '<Response><Say>Hello There!</Say></Response>',
    } as PhoneTemplate;

    afterEach(() => {
      phoneTemplateModel.findOneBy.mockClear();
    });

    it('should yield a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(phoneTemplate);

      // Act/Assert.
      await expect(
        repository.findOne(phoneTemplate.deliveryMethod, phoneTemplate.name),
      ).resolves.toEqual(phoneTemplate);
    });

    it('should yield null if the repository yields null/undefined', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.findOne(phoneTemplate.deliveryMethod, phoneTemplate.name),
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
      phoneTemplateModel.findOneBy.mockClear();
      phoneTemplateModel.create.mockClear();
      phoneTemplateModel.save.mockClear();
    });

    it('should create a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(null);
      phoneTemplateModel.create.mockResolvedValue(phoneTemplate);

      // Act.
      await repository.create(createPhoneTemplateDto);

      // Assert.
      expect(phoneTemplateModel.create).toHaveBeenCalled();
    });

    it('should yield the created phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(null);
      phoneTemplateModel.create.mockResolvedValue(phoneTemplate);
      phoneTemplateModel.save.mockResolvedValue(phoneTemplate);

      // Assert.
      await expect(repository.create(createPhoneTemplateDto)).resolves.toEqual(
        phoneTemplate,
      );
    });

    it('should throw a "ExistsException" if the phone template already exits', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Phone template name=${createPhoneTemplateDto.name} for deliveryMethod=${createPhoneTemplateDto.deliveryMethod} already exists!`,
      );
      phoneTemplateModel.findOneBy.mockResolvedValue({
        name: 'test',
      } as PhoneTemplate);

      // Act/Assert.
      await expect(repository.create(createPhoneTemplateDto)).rejects.toEqual(
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
      phoneTemplateModel.preload.mockClear();
      phoneTemplateModel.save.mockClear();
    });

    it('should update a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOne.mockResolvedValue(phoneTemplate);
      phoneTemplateModel.preload.mockResolvedValue(phoneTemplate);

      // Act.
      await repository.update(DeliveryMethods.CALL, '', updatePhoneTemplateDto);

      // Assert.
      expect(phoneTemplateModel.preload).toHaveBeenCalledWith({
        name: '',
        deliveryMethod: DeliveryMethods.CALL,
        ...updatePhoneTemplateDto,
      });
    });

    it('should yield the updated phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOne.mockResolvedValue(phoneTemplate);
      phoneTemplateModel.preload.mockResolvedValue(phoneTemplate);
      phoneTemplateModel.save.mockResolvedValue(phoneTemplate);

      // Act/Assert.
      await expect(
        repository.update(DeliveryMethods.CALL, '', updatePhoneTemplateDto),
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
        repository.update(
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
      phoneTemplateModel.findOneBy.mockClear();
      phoneTemplateModel.remove.mockClear();
    });

    it('should remove a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(phoneTemplate);

      // Act.
      await repository.remove(DeliveryMethods.SMS, '');

      // Assert.
      expect(phoneTemplateModel.remove).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the phone template does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Phone template name=${phoneTemplate.name} for deliveryMethod=${DeliveryMethods.SMS} not found!`,
      );
      phoneTemplateModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.remove(DeliveryMethods.SMS, phoneTemplate.name),
      ).rejects.toEqual(expectedResult);
    });
  });
});
