import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyRepository } from './api-key.repository';
import { ApiKey } from '../entities/api-key.entity';

export class PostgresApiKeyRepository implements ApiKeyRepository {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async findById(id: string) {
    return this.apiKeyRepository.findOneBy({ id });
  }

  async create(key: {
    id: string;
    name: string;
    apiKey: string;
    expiresAt: Date;
    createdBy: string;
  }) {
    const apiKeyEntity = this.apiKeyRepository.create(key);

    return this.apiKeyRepository.save(apiKeyEntity).catch((error) => {
      if (error.code === PostgresError.UNIQUE_VIOLATION) {
        throw new ExistsException(
          `Api key with name=${key.name} already exists!`,
        );
      }
      throw error;
    });
  }

  async remove(id: string, userId: string) {
    const apiKey = await this.apiKeyRepository.findOneBy({ id });

    if (!apiKey) {
      throw new MissingException(`Api key id=${id} not found!`);
    }

    apiKey.deletedBy = userId;
    apiKey.deletedAt = new Date();

    return this.apiKeyRepository.save(apiKey);
  }
}
