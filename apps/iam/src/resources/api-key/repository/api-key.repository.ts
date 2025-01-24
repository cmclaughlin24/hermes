import { ApiKey } from '../entities/api-key.entity';

export abstract class ApiKeyRepository {
  abstract findById(id: string): Promise<ApiKey>;
  abstract create(key: {
    id: string;
    name: string;
    apiKey: string;
    expiresAt: Date;
    createdBy: string;
  }): Promise<ApiKey>;
  abstract remove(id: string, userId: string): Promise<ApiKey>;
}
