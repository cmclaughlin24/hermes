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
   * @returns {Promise<User>}
   */
  async findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  /**
   * Creates a new user or throws an `ExistsExcception` if an email
   * or phone number already exists.
   * @param {CreateUserInput} createUserInput
   * @returns {Promise<User>}
   */
  async create(createUserInput: CreateUserInput) {
    const hashedPassword = await this.hashingService.hash(
      createUserInput.password,
    );
    const user = this.userRepository.create({
      ...createUserInput,
      password: hashedPassword,
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
    const user = await this.userRepository.preload({
      id,
      ...updateUserInput,
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
}
