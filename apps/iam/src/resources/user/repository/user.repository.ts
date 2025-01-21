import { Injectable } from '@nestjs/common';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export abstract class UserRepository {
  abstract findAll(ids: string[]): Promise<User[]>;
  abstract findById(id: string): Promise<User>;
  abstract findByEmail(
    email: string,
    includePermissions: boolean,
  ): Promise<User>;
  abstract findDeliveryWindows(
    userIds: string[],
  ): Promise<Pick<User, 'id' | 'deliveryWindows'>[]>;
  abstract findPermissions(
    userIds: string[],
  ): Promise<Pick<User, 'id' | 'permissions'>[]>;
  abstract create(createUserInput: CreateUserInput): Promise<User>;
  abstract update(id: string, updateUserInput: UpdateUserInput): Promise<User>;
  abstract remove(id: string): Promise<User>;
}
