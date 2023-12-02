import { errorToGraphQLException } from '@hermes/common';
import { ActiveEntity, Auth, AuthType, IamPermission } from '@hermes/iam';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { GraphQLErrorCode } from '../../common/types/graphql-error-code.type';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyInput } from './dto/create-api-key.input';
import { ActiveKeyData } from './entities/active-key.entity';
import { ApiKey } from './entities/api-key.entity';
import { InvalidApiKeyException } from './errors/invalid-api-key.exception';

@Resolver()
export class ApiKeyResolver {
  private static readonly RESOURCE_IDENTIFIER = 'api_key';

  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Mutation(() => String, { name: 'createApiKey' })
  @IamPermission({
    resource: ApiKeyResolver.RESOURCE_IDENTIFIER,
    action: 'create',
  })
  create(
    @Args('createApiKeyInput') createApiKeyInput: CreateApiKeyInput,
    @ActiveEntity('sub') userId: string,
  ) {
    return this.apiKeyService
      .create(createApiKeyInput, userId)
      .catch((error) => {
        throw errorToGraphQLException(error);
      });
  }

  @Mutation(() => ApiKey, { name: 'removeApiKey' })
  @IamPermission({
    resource: ApiKeyResolver.RESOURCE_IDENTIFIER,
    action: 'remove',
  })
  remove(@Args('id') id: string, @ActiveEntity('sub') userId: string) {
    return this.apiKeyService.remove(id, userId).catch((error) => {
      throw errorToGraphQLException(error);
    });
  }

  @Mutation(() => ActiveKeyData, { name: 'verifyApiKey' })
  @Auth(AuthType.NONE)
  verifyApiKey(@Args('apiKey') apiKey: string) {
    return this.apiKeyService.verifyApiKey(apiKey).catch((error) => {
      if (error instanceof InvalidApiKeyException) {
        throw new GraphQLError('Unauthorized: Invalid api key', {
          extensions: { code: GraphQLErrorCode.UNAUTHENTICATED_ERROR_CODE },
        });
      }
      throw errorToGraphQLException(error);
    });
  }
}
