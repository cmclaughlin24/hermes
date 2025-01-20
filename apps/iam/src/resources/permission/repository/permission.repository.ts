import { CreatePermissionInput } from '../dto/create-permission.input';
import { UpdatePermissionInput } from '../dto/update-permission.input';
import { Permission } from './entities/permission.entity';

export abstract class PermissionRepository {
  abstract findAll(): Promise<Permission[]>;
  abstract findById(id: string): Promise<Permission>;
  abstract findByResourceAction(
    resource: string,
    action: string,
  ): Promise<Permission>;
  abstract create(
    createPermissionInput: CreatePermissionInput,
  ): Promise<Permission>;
  abstract update(
    id: string,
    updatePermissionInput: UpdatePermissionInput,
  ): Promise<Permission>;
  abstract remove(id: string): Promise<Permission>;
}
