import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockRepository,
  MockRepository
} from '../../../../notification/test/helpers/database.helpers';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate } from './entities/email-template.entity';

describe('EmailTemplateService', () => {
  let service: EmailTemplateService;
  let emailTemplateModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplateService,
        {
          provide: getModelToken(EmailTemplate),
          useValue: createMockRepository<EmailTemplate>(),
        },
      ],
    }).compile();

    service = module.get<EmailTemplateService>(EmailTemplateService);
    emailTemplateModel = module.get<MockRepository>(
      getModelToken(EmailTemplate),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('should yield a list of email templates', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "NotFoundException" if the repository return an empty list', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('findOne()', () => {
    it('should yield an email template', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('create()', () => {
    it('should create an email template', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should yield an "ApiResponseDto" object with the created email template', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "BadRequestException" if an email template already exists', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('update()', () => {
    it('should update an email template', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should yield an "ApiResponseDto" object with the updated email template', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('remove()', () => {
    it('should remove an email template', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should yield an "ApiResponseDto" object', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });
});
