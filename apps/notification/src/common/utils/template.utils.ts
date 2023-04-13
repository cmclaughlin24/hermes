import * as flatten from 'flat';

/**
 * Yields a string where the key pattern(s) have been replaced with the corresponding
 * values from the data. Throws an error if key pattern(s) are present and data
 * is null/undefined or if data is not an object.
 * @example
 *  - 'Lorem ipsum dolor {{hello}} amet.';
 *  - 'Lorem ipsum dolor {{ hello.world }} amet.';
 * @param {string} text
 * @param {any} data 
 * @returns {string}
 */
export function compileTextTemplate(text: string, data: any): string {
  const regexPattern = /\{\{[\s\S][a-zA-Z0-1\.]+[\s\S]\}\}/g;

  if (!regexPattern.test(text)) {
    return text;
  }

  if (!data) {
    throw new Error(
      'Invalid Argument: data cannot be null/undefined if the key pattern is present',
    );
  }

  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(
      `Invalid Argument: data must be type 'object', recieved ${
        Array.isArray(data) ? 'array' : typeof data
      }`,
    );
  }

  const flatData = flatten(data);

  return text.replace(regexPattern, (match) => {
    const key = match.replace(/^\{\{|\}\}$/g, '').trim();
    return flatData[key];
  });
}
