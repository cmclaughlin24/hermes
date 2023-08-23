/**
 * This custom exception class is intended to be thrown when non-null
 * value is encountered in a situation where null/undefined was expected.
 */
export class ExistsException extends Error {}
