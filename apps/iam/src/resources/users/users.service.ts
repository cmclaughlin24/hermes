import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashingService } from '../../common/services/hashing.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async create(createUserInput: CreateUserInput) {
    try {
    } catch (error) {}
  }
}
