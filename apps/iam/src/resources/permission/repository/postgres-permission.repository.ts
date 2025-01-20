import { InjectRepository } from '@nestjs/typeorm';
import { PermissionRepository } from './permission.repository';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { CreatePermissionInput } from '../dto/create-permission.input';
import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { UpdatePermissionInput } from '../dto/update-permission.input';

export class PostgresPermissionRepository implements PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll() {
    return this.permissionRepository.find();
  }

  async findById(id: string) {
    return this.permissionRepository.findOneBy({ id });
  }

  async findByResourceAction(resource: string, action: string) {
    return this.permissionRepository.findOneBy({ resource, action });
  }

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

  async remove(id: string) {
    const permission = await this.findById(id);

    if (!permission) {
      throw new MissingException(`Permission id=${id} not found!`);
    }

    return this.permissionRepository.remove(permission);
  }
}
