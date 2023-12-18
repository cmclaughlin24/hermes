import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Yields a list of permissions.
   * @returns {Promise<Permission[]>}
   */
  async findAll() {
    return this.permissionRepository.find();
  }

  /**
   * Yields a permission by id.
   * @param {string} id
   * @returns {Promise<Permission>}
   */
  async findById(id: string) {
    return this.permissionRepository.findOneBy({ id });
  }

  /**
   * Yields a permission by resource and action.
   * @param {string} resource
   * @param {string} action
   * @returns {Promise<Permission>}
   */
  async findByResourceAction(resource: string, action: string) {
    return this.permissionRepository.findOneBy({ resource, action });
  }

  /**
   * Creates a new permission or throws an `ExistsException` if the resource
   * and action combination already exists.
   * @param {CreatePermissionInput} createPermissionInput
   * @returns {Promise<Permission>}
   */
  async create(createPermissionInput: CreatePermissionInput) {
    const permission = this.permissionRepository.create({
      ...createPermissionInput,
    });

    return this.permissionRepository.save(permission).catch((error) => {
      if (error.code === PostgresError.UNIQUE_VIOLATION) {
        throw new ExistsException(
          `Permission for resource=${createPermissionInput.resource} action=${createPermissionInput.action} already exists!`,
        );
      }
      throw error;
    });
  }

  /**
   * Update a permission. Throws a `MissingException` if the repository returns null/undefined
   * or an `ExistsException` if the resource and action combination already exists.
   * @param {string} id
   * @param {UpdatePermissionInput} updatePermissionInput 
   * @returns {Promise<Permission>}
   */
  async update(id: string, updatePermissionInput: UpdatePermissionInput) {
    const permission = await this.permissionRepository.preload({
      id,
      ...updatePermissionInput,
    });

    if (!permission) {
      throw new MissingException(`Permission id=${id} not found!`);
    }

    return this.permissionRepository.save(permission).catch((error) => {
      if (error.code === PostgresError.UNIQUE_VIOLATION) {
        throw new ExistsException(
          `Permission for resource=${updatePermissionInput.resource} action=${updatePermissionInput.action} already exists!`,
        );
      }
      throw error;
    });
  }

  /**
   * Removes a permission or throws a `MissingException` if the repository returns
   * null/undefined.
   * @param {string} id 
   * @returns {Promise<Permission>}
   */
  async remove(id: string) {
    const permission = await this.findById(id);

    if (!permission) {
      throw new MissingException(`Permission id=${id} not found!`);
    }

    return this.permissionRepository.remove(permission);
  }
}
