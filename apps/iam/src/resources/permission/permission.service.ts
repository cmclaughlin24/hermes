import { Injectable } from '@nestjs/common';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { PermissionRepository } from './repository/permission.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly repository: PermissionRepository) {}

  /**
   * Yields a list of permissions.
   */
  async findAll() {
    return this.repository.findAll();
  }

  /**
   * Yields a permission by id.
   * @param {string} id
   */
  async findById(id: string) {
    return this.repository.findById(id);
  }

  /**
   * Yields a permission by resource and action.
   * @param {string} resource
   * @param {string} action
   */
  async findByResourceAction(resource: string, action: string) {
    return this.repository.findByResourceAction(resource, action);
  }

  /**
   * Creates a new permission or throws an `ExistsException` if the resource
   * and action combination already exists.
   * @param {CreatePermissionInput} createPermissionInput
   */
  async create(createPermissionInput: CreatePermissionInput) {
    return this.repository.create(createPermissionInput);
  }

  /**
   * Update a permission. Throws a `MissingException` if the repository returns null/undefined
   * or an `ExistsException` if the resource and action combination already exists.
   * @param {string} id
   * @param {UpdatePermissionInput} updatePermissionInput
   */
  async update(id: string, updatePermissionInput: UpdatePermissionInput) {
    return this.repository.update(id, updatePermissionInput);
  }

  /**
   * Removes a permission or throws a `MissingException` if the repository returns
   * null/undefined.
   * @param {string} id
   */
  async remove(id: string) {
    return this.repository.remove(id);
  }
}
