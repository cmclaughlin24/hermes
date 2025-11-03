import { ApiKeyEntity } from './entities/api-key.entity';

export abstract class ApiKeyRepository {
  abstract findById(id: string): Promise<ApiKeyEntity>;
  abstract create(key: {
    id: string;
    name: string;
    apiKey: string;
    expiresAt: Date;
    createdBy: string;
  }): Promise<ApiKeyEntity>;
  abstract remove(id: string, userId: string): Promise<ApiKeyEntity>;
}
