import {
  ExistsException,
  MissingException,
  PostgresError,
  RemoveCache,
  UseCache,
  defaultHashFn,
} from '@hermes/common';
import { ActiveEntityData, packPermissions } from '@hermes/iam';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import * as _ from 'lodash';
import { Repository } from 'typeorm';
import { HashingService } from '../../common/services/hashing.service';
import { CreatePermissionInput } from '../permission/dto/create-permission.input';
import { PermissionService } from '../permission/permission.service';
import { CreateApiKeyInput } from './dto/create-api-key.input';
import { ApiKey } from './entities/api-key.entity';
import { InvalidApiKeyException } from './errors/invalid-api-key.exception';

@Injectable()
export class ApiKeyService {
  private static readonly CACHE_KEY = 'api-key';

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly hashingService: HashingService,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Creates a new api key or throws an `ExistsException` if an api key
   * name already exists for a user.
   * @param {CreateApiKeyInput} createApiKeyInput
   * @param {string} userId 
   * @returns {Promise<string>}
   */
  async create(createApiKeyInput: CreateApiKeyInput, userId: string) {
    const apiKeyId = randomUUID();
    const permissions = await this._getPermissions(
      createApiKeyInput.permissions,
    );
    const apiKey = this._generateApiKey({
      sub: apiKeyId,
      authorization_details: packPermissions(permissions),
    });
    const hashedKey = await this.hashingService.hash(apiKey);

    try {
      const apiKeyEntity = this.apiKeyRepository.create({
        id: apiKeyId,
        name: createApiKeyInput.name,
        apiKey: hashedKey,
        createdBy: userId,
      });

      await this.apiKeyRepository.save(apiKeyEntity);
    } catch (error) {
      if (error.code === PostgresError.UNIQUE_VIOLATION) {
        throw new ExistsException(
          `Api key with name=${createApiKeyInput.name} already exists for user id=${userId}!`,
        );
      }
      throw error;
    }

    return apiKey;
  }

  /**
   * Removes an api key or throws a `MissingException` if the repository
   * returns null or undefined.
   * 
   * Note: A soft (paranoid) delete is performed so that audit history can
   *       be maintained for operations performed by the entity.
   * 
   * @param {string} id
   * @param {string} userId 
   * @returns {Promise<ApiKey>}
   */
  @RemoveCache({
    key: ApiKeyService.CACHE_KEY,
    hashFn: (key, args) => defaultHashFn(key, [args[0]]),
  })
  async remove(id: string, userId: string) {
    const apiKey = await this.apiKeyRepository.findOneBy({ id });

    if (!apiKey) {
      throw new MissingException(`Api key id=${id} not found!`);
    }

    apiKey.deletedBy = userId;
    apiKey.deletedAt = new Date();

    return this.apiKeyRepository.save(apiKey);
  }

  /**
   * Yields an `ActiveEntityData` or throws an `InvalidApiKeyException` if the token
   * is invalid.
   * @param {string} apiKey
   * @returns {Promise<ActiveEntityData>}
   */
  async verifyApiKey(apiKey: string) {
    const entity = this._extractEntityFromApiKey(apiKey);
    const apiKeyEntity = await this._getApiKey(entity.sub);
    const isValidApiKey = await this.hashingService.compare(
      apiKey,
      apiKeyEntity.apiKey,
    );

    if (!isValidApiKey) {
      throw new InvalidApiKeyException();
    }

    return entity;
  }

  @UseCache({ key: ApiKeyService.CACHE_KEY, ttl: 30000 })
  private async _getApiKey(id: string) {
    return this.apiKeyRepository.findOneBy({ id });
  }

  private _generateApiKey(activeEntityData: ActiveEntityData) {
    return Buffer.from(JSON.stringify(activeEntityData)).toString('base64');
  }

  private _extractEntityFromApiKey(apiKey: string): ActiveEntityData {
    return JSON.parse(Buffer.from(apiKey, 'base64').toString('ascii'));
  }

  /**
   * Yields a list of permissions.
   * @param {CreatePermissionInput} permissions
   * @returns {Promise<Permission[]>}
   */
  private async _getPermissions(permissions: CreatePermissionInput[]) {
    if (_.isEmpty(permissions)) {
      return null;
    }

    return Promise.all(
      permissions.map((p) => this._findPermission(p.resource, p.action)),
    );
  }

  /**
   * Yields a permission by resource and action or throws a `MissingException` if
   * a permission does not exist.
   * @param {string} resource
   * @param {string} action
   * @returns {Promise<Permission>}
   */
  private async _findPermission(resource: string, action: string) {
    const permission = await this.permissionService.findByResourceAction(
      resource,
      action,
    );

    if (!permission) {
      throw new MissingException(
        `Permission resource=${resource} action=${action} not found!`,
      );
    }

    return permission;
  }
}
