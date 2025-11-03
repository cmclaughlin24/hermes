import { ApolloServerErrorCode } from '@apollo/server/errors';
import { errorToGraphQLException } from '@hermes/common';
import { IamPermission } from '@hermes/iam';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { Permission } from './repository/entities/permission.entity';
import { PermissionService } from './permission.service';

@Resolver(() => Permission)
export class PermissionResolver {
  private static readonly RESOURCE_IDENTIFIER = 'permission';

  constructor(private readonly permissionService: PermissionService) {}

  @Query(() => [Permission], { name: 'permissions' })
  @IamPermission({
    resource: PermissionResolver.RESOURCE_IDENTIFIER,
    action: 'list'
  })
  async findAll() {
    return this.permissionService.findAll();
  }

  @Query(() => Permission, { name: 'permission' })
  @IamPermission({
    resource: PermissionResolver.RESOURCE_IDENTIFIER,
    action: 'get'
  })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    const permission = await this.permissionService.findById(id);

    if (!permission) {
      throw new GraphQLError(`Permission id=${id} not found!`, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
    }

    return permission;
  }

  @Mutation(() => Permission, { name: 'createPermission' })
  @IamPermission({
    resource: PermissionResolver.RESOURCE_IDENTIFIER,
    action: 'create'
  })
  create(
    @Args('createPermissionInput') createPermissionInput: CreatePermissionInput,
  ) {
    return this.permissionService
      .create(createPermissionInput)
      .catch((error) => {
        throw errorToGraphQLException(error);
      });
  }

  @Mutation(() => Permission, { name: 'updatePermission' })
  @IamPermission({
    resource: PermissionResolver.RESOURCE_IDENTIFIER,
    action: 'update'
  })
  update(
    @Args('id', { type: () => ID }) id: string,
    @Args('updatePermissionInput') updatePermissionInput: UpdatePermissionInput,
  ) {
    return this.permissionService
      .update(id, updatePermissionInput)
      .catch((error) => {
        throw errorToGraphQLException(error);
      });
  }

  @Mutation(() => Permission, { name: 'removePermission' })
  @IamPermission({
    resource: PermissionResolver.RESOURCE_IDENTIFIER,
    action: 'remove'
  })
  remove(@Args('id', { type: () => ID }) id: string) {
    return this.permissionService.remove(id).catch((error) => {
      throw errorToGraphQLException(error);
    });
  }
}
