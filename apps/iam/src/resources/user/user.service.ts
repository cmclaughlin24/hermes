import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashingService } from '../../common/services/hashing.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async create(createUserInput: CreateUserInput) {
    try {
      const user = this.userRepository.create({
        ...createUserInput,
      });

      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === PostgresError.UNIQUE_VIOLATION) {
        throw new ExistsException(
          `User with email=${createUserInput.email} or phoneNumber=${createUserInput.phoneNumber} already exists!`,
        );
      }
      throw error;
    }
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserInput,
    });

    if (!user) {
      throw new MissingException(`User userId=${id} not found!`);
    }

    return this.userRepository.save(user);
  }

  async delete(id: string) {
    const user = await this.findOne(id);

    if (!user) {
      throw new MissingException(`User userId=${id} not found!`);
    }

    return this.userRepository.remove(user);
  }
}