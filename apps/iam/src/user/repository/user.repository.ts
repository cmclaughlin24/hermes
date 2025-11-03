import { Injectable } from '@nestjs/common';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { UserEntity } from './entities/user.entity';

@Injectable()
export abstract class UserRepository {
  abstract findAll(ids: string[]): Promise<UserEntity[]>;
  abstract findById(id: string): Promise<UserEntity>;
  abstract findByEmail(
    email: string,
    includePermissions: boolean,
  ): Promise<UserEntity>;
  abstract findDeliveryWindows(
    userIds: string[],
  ): Promise<Pick<UserEntity, 'id' | 'deliveryWindows'>[]>;
  abstract findPermissions(
    userIds: string[],
  ): Promise<Pick<UserEntity, 'id' | 'permissions'>[]>;
  abstract create(createUserInput: CreateUserInput): Promise<UserEntity>;
  abstract update(id: string, updateUserInput: UpdateUserInput): Promise<UserEntity>;
  abstract remove(id: string): Promise<UserEntity>;
}
