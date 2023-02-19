import { EmailTemplateService } from '../../../notification/src/resources/email-template/email-template.service';

export type MockEmailTemplateService = Partial<
  Record<keyof EmailTemplateService, jest.Mock>
>;

export const createEmailTemplateServiceMock = (): MockEmailTemplateService => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});
