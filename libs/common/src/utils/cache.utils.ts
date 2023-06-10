import * as _ from 'lodash';

/**
 * Yields a unique key hash used to subsequently store and retreive cached
 * data. Appends a stringified version of each argument separated by a
 * comma to the key.
 * @example
 * - "email-template::'order-confirmation','{\"name\":\"example\"}'"
 * @param {string} key
 * @param {any[]} args
 * @returns {string}
 */
export function defaultHashFn(key: string, args: any[]) {
  if (_.isEmpty(args)) {
    return key;
  }

  return key + `::${args.map((arg) => JSON.stringify(arg)).join(',')}`;
}
