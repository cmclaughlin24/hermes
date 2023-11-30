import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Repository } from 'typeorm';
import { HashingService } from '../../common/services/hashing.service';
import { CreatePermissionInput } from '../permission/dto/create-permission.input';
import { Permission } from '../permission/entities/permission.entity';
import { PermissionService } from '../permission/permission.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Yields a list of users.
   * @returns {Promise<User[]>}
   */
  async findAll() {
    return this.userRepository.find();
  }

  /**
   * Yields a user by id.
   * @param {string} id
   * @returns {Promise<User>}
   */
  async findById(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  /**
   * Yields a user by email.
   * @param {string} email
   * @param {boolean} includePermissions
   * @returns {Promise<User>}
   */
  async findByEmail(email: string, includePermissions: boolean = false) {
    return this.userRepository.findOne({
      where: { email },
      relations: includePermissions ? ['permissions'] : [],
    });
  }

  /**
   * Creates a new user or throws an `ExistsException` if an email
   * or phone number already exists.
   * @param {CreateUserInput} createUserInput
   * @returns {Promise<User>}
   */
  async create(createUserInput: CreateUserInput) {
    const hashedPassword = await this.hashingService.hash(
      createUserInput.password,
    );
    const permissions = await this._getPermissions(createUserInput.permissions);
    const user = this.userRepository.create({
      ...createUserInput,
      password: hashedPassword,
      permissions,
    });

    return this.userRepository.save(user).catch((error) => {
      if (error.code === PostgresError.UNIQUE_VIOLATION) {
        throw new ExistsException(
          `User with email=${createUserInput.email} or phoneNumber=${createUserInput.phoneNumber} already exists!`,
        );
      }
      throw error;
    });
  }

  /**
   * Updates a user or throws a `MissingException` if the repository
   * returns null or undefined.
   * @param {string} id
   * @param {UpdateUserInput} updateUserInput
   * @returns {Promise<User>}
   */
  async update(id: string, updateUserInput: UpdateUserInput) {
    const permissions = await this._getPermissions(updateUserInput.permissions);
    const user = await this.userRepository.preload({
      id,
      ...updateUserInput,
      permissions,
    });

    if (!user) {
      throw new MissingException(`User userId=${id} not found!`);
    }

    return this.userRepository.save(user);
  }

  /**
   * Removes a user or throws a `MissingException` if the repository
   * returns null or undefined.
   * @param {string} id
   * @returns {Promise<User>}
   */
  async remove(id: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new MissingException(`User userId=${id} not found!`);
    }

    return this.userRepository.remove(user);
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
