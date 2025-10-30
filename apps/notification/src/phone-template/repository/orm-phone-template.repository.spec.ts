import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
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
} from '../../../test/helpers/database.helper';
import { CreatePhoneTemplateDto } from '../dto/create-phone-template.dto';
import { UpdatePhoneTemplateDto } from '../dto/update-phone-template.dto';
import { PhoneTemplateEntity } from './entities/phone-template.entity';
import { OrmPhoneTemplateRepository } from './orm-phone-template.repository';
import { PhoneTemplate } from '../domain/phone-template';
import { PhoneTemplateProfile } from '../profiles/phone-template.profile';

describe('OrmPhoneTemplateRepository', () => {
  let repository: OrmPhoneTemplateRepository;
  let phoneTemplateModel: MockRepository;

  const entity = new PhoneTemplateEntity();
  entity.name = 'unit-test';
  entity.deliveryMethod = DeliveryMethods.SMS;
  entity.template = '<Response><Say>Hello There!</Say></Response>';
  entity.context = null;
  entity.createdAt = new Date();
  entity.updatedAt = new Date();

  const template = new PhoneTemplate();
  template.name = entity.name
  template.deliveryMethod = entity.deliveryMethod;
  template.template = entity.template;
  template.context = entity.context;
  template.createdAt = entity.createdAt
  template.updatedAt = entity.updatedAt;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AutomapperModule.forRoot({ strategyInitializer: classes() })],
      providers: [
        OrmPhoneTemplateRepository,
        PhoneTemplateProfile,
        {
          provide: getRepositoryToken(PhoneTemplateEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    repository = module.get<OrmPhoneTemplateRepository>(
      OrmPhoneTemplateRepository,
    );
    phoneTemplateModel = module.get<MockRepository>(
      getRepositoryToken(PhoneTemplateEntity),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      phoneTemplateModel.find.mockClear();
    });

    it('should yield a list of phone templates', async () => {
      // Arrange.
      const expectedResult = [template];
      phoneTemplateModel.find.mockResolvedValue([entity]);

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
    afterEach(() => {
      phoneTemplateModel.findOneBy.mockClear();
    });

    it('should yield a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(entity);

      // Act/Assert.
      await expect(
        repository.findOne(template.deliveryMethod, template.name),
      ).resolves.toEqual(template);
    });

    it('should yield null if the repository yields null/undefined', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.findOne(template.deliveryMethod, template.name),
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

    afterEach(() => {
      phoneTemplateModel.findOneBy.mockClear();
      phoneTemplateModel.create.mockClear();
      phoneTemplateModel.save.mockClear();
    });

    it('should create a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(null);
      phoneTemplateModel.create.mockResolvedValue(entity);
      phoneTemplateModel.save.mockResolvedValue(template);

      // Act.
      await repository.create(createPhoneTemplateDto);

      // Assert.
      expect(phoneTemplateModel.create).toHaveBeenCalled();
    });

    it('should yield the created phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(null);
      phoneTemplateModel.create.mockResolvedValue(entity);
      phoneTemplateModel.save.mockResolvedValue(template);

      // Assert.
      await expect(repository.create(createPhoneTemplateDto)).resolves.toEqual(
        template,
      );
    });

    it('should throw a "ExistsException" if the phone template already exits', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Phone template name=${createPhoneTemplateDto.name} for deliveryMethod=${createPhoneTemplateDto.deliveryMethod} already exists!`,
      );
      phoneTemplateModel.findOneBy.mockResolvedValue({
        name: 'test',
      } as PhoneTemplateEntity);

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

    afterEach(() => {
      phoneTemplateModel.preload.mockClear();
      phoneTemplateModel.save.mockClear();
    });

    it('should update a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOne.mockResolvedValue(entity);
      phoneTemplateModel.preload.mockResolvedValue(entity);
      phoneTemplateModel.save.mockResolvedValue(template);

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
      phoneTemplateModel.findOne.mockResolvedValue(entity);
      phoneTemplateModel.preload.mockResolvedValue(entity);
      phoneTemplateModel.save.mockResolvedValue(template);

      // Act/Assert.
      await expect(
        repository.update(DeliveryMethods.CALL, '', updatePhoneTemplateDto),
      ).resolves.toEqual(template);
    });

    it('should throw a "MissingException" if the phone template does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Phone template name=${template.name} for deliveryMethod=${DeliveryMethods.CALL} not found!`,
      );
      phoneTemplateModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.update(
          DeliveryMethods.CALL,
          entity.name,
          updatePhoneTemplateDto,
        ),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {

    afterEach(() => {
      phoneTemplateModel.findOneBy.mockClear();
      phoneTemplateModel.remove.mockClear();
    });

    it('should remove a phone template', async () => {
      // Arrange.
      phoneTemplateModel.findOneBy.mockResolvedValue(entity);

      // Act.
      await repository.remove(DeliveryMethods.SMS, '');

      // Assert.
      expect(phoneTemplateModel.remove).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the phone template does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Phone template name=${entity.name} for deliveryMethod=${DeliveryMethods.SMS} not found!`,
      );
      phoneTemplateModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.remove(DeliveryMethods.SMS, entity.name),
      ).rejects.toEqual(expectedResult);
    });
  });
});
