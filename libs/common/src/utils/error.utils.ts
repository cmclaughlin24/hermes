/**
 * Converts an `Error` object to a JSON representation or throws an error
 * if the input is not an instance of `Error`.
 * @param {Error} error The `Error` object to convert to JSON
 * @returns {Record<string, any> | null} - The JSON representation of the `Error` object, or null if the input is null/undefined.
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
