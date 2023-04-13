import * as flatten from 'flat';

/**
 * Yields a string where the key pattern(s) have been replaced with the corresponding
 * values from the context. Throws an error if key pattern(s) are present and context
 * is null/undefined or if context is not an object.
 * @example
 *  - 'Lorem ipsum dolor {{hello}} amet.';
 *  - 'Lorem ipsum dolor {{ hello.world }} amet.';
 * @param {string} text
 * @param {any} context 
 * @returns {string}
 */
export function compileTextTemplate(text: string, context: any): string {
  const regexPattern = /\{\{[\s\S][a-zA-Z0-1\.]+[\s\S]\}\}/g;

  if (!regexPattern.test(text)) {
    return text;
  }

  if (!context) {
    throw new Error(
      'Invalid Argument: context cannot be null/undefined if the key pattern is present',
    );
  }

  if (typeof context !== 'object' || Array.isArray(context)) {
    throw new Error(
      `Invalid Argument: context must be type 'object', recieved ${
        Array.isArray(context) ? 'array' : typeof context
      }`,
    );
  }

  const flatContext = flatten(context);

  return text.replace(regexPattern, (match) => {
    const key = match.replace(/^\{\{|\}\}$/g, '').trim();
    return flatContext[key];
  });
}
