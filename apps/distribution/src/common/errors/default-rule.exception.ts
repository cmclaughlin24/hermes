/**
 * This custom exception class is designed to be thrown when
 * one or more the default distribution rule modification constraints
 * is violated.
 * @examples
 * - Attempting to delete the default rule for an event.
 * - Attempting to change the metadata for a rule.
 * - Creating a distribution event w/o a default rule.
 */
export class DefaultRuleException extends Error {}
