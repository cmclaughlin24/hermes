import { MissingException } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { HashingService } from '../../common/services/hashing.service';
import { TokenStorage } from '../../common/storage/token.storage';
import { CreatePermissionInput } from '../permission/dto/create-permission.input';
import { PermissionService } from '../permission/permission.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './repository/entities/user.entity';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenStorage: TokenStorage,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Yields a list of users.
   */
  async findAll(ids: string[]) {
    return this.repository.findAll(ids);
  }

  /**
   * Yields a user by id.
   * @param {string} id
   */
  async findById(id: string) {
    return this.repository.findById(id);
  }

  /**
   * Yields a user by email.
   * @param {string} email
   * @param {boolean} includePermissions
   */
  async findByEmail(email: string, includePermissions: boolean = false) {
    return this.repository.findByEmail(email, includePermissions);
  }

  /**
   * Yields a list of users with their delivery windows.
   * @param {string} userIds
   * @returns {Promise<Pick<User, 'id' | 'deliveryWindows'>[]>}
   */
  async findDeliveryWindows(
    userIds: string[],
  ): Promise<Pick<User, 'id' | 'deliveryWindows'>[]> {
    return this.repository.findDeliveryWindows(userIds);
  }

  /**
   * Yields a list of users with their permissions.
   * @param {string} userIds
   * @returns {Promise<Pick<User, 'id' | 'permissions'>[]>}
   */
  async findPermissions(
    userIds: string[],
  ): Promise<Pick<User, 'id' | 'permissions'>[]> {
    return this.repository.findPermissions(userIds);
  }

  /**
   * Creates a new user or throws an `ExistsException` if an email
   * or phone number already exists.
   * @param {CreateUserInput} createUserInput
   */
  async create(createUserInput: CreateUserInput) {
    const hashedPassword = await this.hashingService.hash(
      createUserInput.password,
    );
    const permissions = await this._getPermissions(createUserInput.permissions);

    return this.repository.create({
      ...createUserInput,
      password: hashedPassword,
      permissions,
    });
  }

  /**
   * Updates a user or throws a `MissingException` if the repository
   * returns null or undefined.
   * @param {string} id
   * @param {UpdateUserInput} updateUserInput
   */
  async update(id: string, updateUserInput: UpdateUserInput) {
    const permissions = await this._getPermissions(updateUserInput.permissions);
    const user = await this.repository.update(id, {
      ...updateUserInput,
      permissions,
    });

    if (!user) {
      throw new MissingException(`User userId=${id} not found!`);
    }

    // Note: Invalidate the user's active access token (if issued).
    await this.tokenStorage.remove(user.id);

    return user;
  }

  /**
   * Removes a user or throws a `MissingException` if the repository
   * returns null or undefined.
   * @param {string} id
   */
  async remove(id: string) {
    const user = await this.repository.remove(id);

    // Note: Invalidate the user's active access token (if issued).
    await this.tokenStorage.remove(user.id);

    return user;
  }

  /**
   * Yields a list of permissions.
   * @param {CreatePermissionInput} permissions
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
