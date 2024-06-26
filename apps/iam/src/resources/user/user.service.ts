import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { In, Repository } from 'typeorm';
import { HashingService } from '../../common/services/hashing.service';
import { TokenStorage } from '../../common/storage/token.storage';
import { CreatePermissionInput } from '../permission/dto/create-permission.input';
import { Permission } from '../permission/entities/permission.entity';
import { PermissionService } from '../permission/permission.service';
import { CreateUserInput } from './dto/create-user.input';
import { DeliveryWindowInput } from './dto/delivery-window.input';
import { UpdateUserInput } from './dto/update-user.input';
import { DeliveryWindow } from './entities/delivery-window.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(DeliveryWindow)
    private readonly windowRepository: Repository<DeliveryWindow>,
    private readonly hashingService: HashingService,
    private readonly tokenStorage: TokenStorage,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Yields a list of users.
   * @returns {Promise<User[]>}
   */
  async findAll(ids: string[]) {
    const where = {};

    if (!_.isEmpty(ids)) {
      where['id'] = In(ids);
    }

    return this.userRepository.find({ where });
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
   * Yields a list of users with their delivery windows.
   * @param {string} userIds
   * @returns {Promise<Pick<User, 'id' | 'deliveryWindows'>[]>}
   */
  async findDeliveryWindows(
    userIds: string[],
  ): Promise<Pick<User, 'id' | 'deliveryWindows'>[]> {
    return this.userRepository.find({
      select: ['id'],
      relations: ['deliveryWindows'],
      where: {
        id: In(userIds),
      },
    });
  }

  /**
   * Yields a list of users with their permissions.
   * @param {string} userIds
   * @returns {Promise<Pick<User, 'id' | 'deliveryWindows'>[]>}
   */
  async findPermissions(
    userIds: string[],
  ): Promise<Pick<User, 'id' | 'permissions'>[]> {
    return this.userRepository.find({
      select: ['id'],
      relations: ['permissions'],
      where: {
        id: In(userIds),
      },
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
    const deliveryWindows =
      createUserInput.deliveryWindows &&
      createUserInput.deliveryWindows.map((window) =>
        this.windowRepository.create({ ...window }),
      );
    const user = this.userRepository.create({
      ...createUserInput,
      password: hashedPassword,
      deliveryWindows,
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
    const deliveryWindows =
      updateUserInput.deliveryWindows &&
      (await Promise.all(
        updateUserInput.deliveryWindows.map((window) =>
          this._preloadDeliveryWindow(window),
        ),
      ));
    let user = await this.userRepository.preload({
      id,
      ...updateUserInput,
      permissions,
      deliveryWindows,
    });

    if (!user) {
      throw new MissingException(`User userId=${id} not found!`);
    }

    user = await this.userRepository.save(user);
    // Note: Invalidate the user's active access token (if issued).
    await this.tokenStorage.remove(user.id);

    return user;
  }

  /**
   * Removes a user or throws a `MissingException` if the repository
   * returns null or undefined.
   * @param {string} id
   * @returns {Promise<User>}
   */
  async remove(id: string) {
    let user = await this.findById(id);

    if (!user) {
      throw new MissingException(`User userId=${id} not found!`);
    }

    user = await this.userRepository.remove(user);
    // Note: Invalidate the user's active access token (if issued).
    await this.tokenStorage.remove(user.id);

    return user;
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

  /**
   * Updates a delivery window or creates it doesn't exist.
   * @param {DeliveryWindowInput} deliveryWindowInput
   * @returns {Promise<DeliveryWindow>}
   */
  private async _preloadDeliveryWindow(
    deliveryWindowInput: DeliveryWindowInput,
  ) {
    let deliveryWindow;

    if (deliveryWindowInput.id) {
      deliveryWindow = await this.windowRepository.preload({
        ...deliveryWindowInput,
      });
    }

    if (deliveryWindow) {
      return deliveryWindow;
    }

    return this.windowRepository.create({ ...deliveryWindowInput });
  }
}
