import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';

describe('EmailTemplateController', () => {
  let controller: EmailTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailTemplateController],
      providers: [{ provide: EmailTemplateService, useValue: {} }],
    }).compile();

    controller = module.get<EmailTemplateController>(EmailTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should yield a list of email templates', () => {
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
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });
});
