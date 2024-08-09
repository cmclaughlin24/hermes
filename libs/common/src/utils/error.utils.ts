import { ApolloServerErrorCode } from '@apollo/server/errors';
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { ExistsException } from '../errors/exists.exception';
import { MissingException } from '../errors/missing.exception';

/**
 * Converts an `Error` object to a JSON representation or throws an error
 * if the input is not an instance of `Error`.
 * @param {Error} error The `Error` object to convert to JSON
 * @returns {Record<string, any> | null} The JSON representation of the `Error` object, or null if the input is null/undefined.
 */
export function errorToJson(value: Error) {
  if (!value) {
    return null;
  }

  if (!(value instanceof Error)) {
    throw new Error('Invalid Argument: expected instance of Error');
  }

  const error: Record<string, any> = {};

  Object.getOwnPropertyNames(value).forEach(function (propName: string) {
    error[propName] = value[propName];
  });

  return error;
}

/**
 * Converts an `Error` object into a `HttpException` or throws an error
 * if the input is null/undefined.
 * @param {Error} error `Error` object to be converted to a `HttpException`
 * @returns {HttpException}
 */
export function errorToHttpException(error: Error): HttpException {
  if (!error) {
    throw new Error(
      'Invalid Argument: cannot convert argument of null/undefined; expected instance of Error',
    );
  }

  let exception = new InternalServerErrorException(error.message);

  if (isExistsException(error)) {
    exception = new BadRequestException(error.message);
  } else if (isMissingException(error)) {
    exception = new NotFoundException(error.message);
  }

  return exception;
}

/**
 * Converts an `Error` object into a `GraphQLError` or throws an error
 * @param {Error} error `Error` object to be converted to a `GraphQLError`
 * @returns {GraphQLError}
 */
export function errorToGraphQLException(error: Error): GraphQLError {
  if (!error) {
    throw new Error(
      'Invalid Argument: cannot convert argument of null/undefined; expected instance of Error',
    );
  }

  let exception = new GraphQLError(error.message, {
    extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
  });

  if (isExistsException(error) || isMissingException(error)) {
    exception.extensions.code = ApolloServerErrorCode.BAD_USER_INPUT;
  }

  return exception;
}

function isExistsException(error: Error): boolean {
  return error instanceof ExistsException;
}

function isMissingException(error: Error): boolean {
  return error instanceof MissingException;
}
