import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { DeliveryWindow } from './entities/delivery-window.entity';
import { In } from 'typeorm';
import { CreateUserInput } from '../dto/create-user.input';
import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { UpdateUserInput } from '../dto/update-user.input';
import { DeliveryWindowInput } from '../dto/delivery-window.input';

@Injectable()
export class OrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(DeliveryWindow)
    private readonly windowRepository: Repository<DeliveryWindow>,
  ) {}

  async findAll(ids: string[]) {
    const where = {};

    if (!_.isEmpty(ids)) {
      where['id'] = In(ids);
    }

    return this.userRepository.find({ where });
  }

  async findById(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string, includePermissions: boolean = false) {
    return this.userRepository.findOne({
      where: { email },
      relations: includePermissions ? ['permissions'] : [],
    });
  }

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

  async create(createUserInput: CreateUserInput) {
    const deliveryWindows =
      createUserInput.deliveryWindows &&
      createUserInput.deliveryWindows.map((window) =>
        this.windowRepository.create({ ...window }),
      );
    const user = this.userRepository.create({
      ...createUserInput,
      deliveryWindows,
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

  async update(id: string, updateUserInput: UpdateUserInput) {
    const deliveryWindows =
      updateUserInput.deliveryWindows &&
      (await Promise.all(
        updateUserInput.deliveryWindows.map((window) =>
          this._preloadDeliveryWindow(window),
        ),
      ));
    const user = await this.userRepository.preload({
      id,
      ...updateUserInput,
      deliveryWindows,
    });

    if (!user) {
      throw new MissingException(`User userId=${id} not found!`);
    }

    return this.userRepository.save(user);
  }

  async remove(id: string) {
    let user = await this.findById(id);

    if (!user) {
      throw new MissingException(`User userId=${id} not found!`);
    }

    return this.userRepository.remove(user);
  }

  private async _preloadDeliveryWindow(
    deliveryWindowInput: DeliveryWindowInput,
  ) {
    let deliveryWindow: DeliveryWindow;

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
