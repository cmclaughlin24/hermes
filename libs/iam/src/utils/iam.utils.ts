import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

/**
 * Yields the `Request` object from the current execution process.
 * @param {ExecutionContext} context
 * @returns {Request}
 */
export function getRequest(context: ExecutionContext): Request {
  if (context.getType<GqlContextType>() === 'graphql') {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.req;
  }

  return context.switchToHttp().getRequest<Request>();
}
