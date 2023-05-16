// Note: MqConsumer is a parent class for storing commonized functionality required
//       by all consumers.
export class MqConsumer {
  constructor() {}

  /**
   * Yields a formatted string with the function's name in square brackets followed
   * by the RabbitMQ message id.
   * @example
   * - '[functionName] Message messageId'
   * @param {string} functionName
   * @param {string} messageId
   * @returns {string}
   */
  protected createLogPrefix(functionName: string, messageId: string): string {
    return `[${functionName}] Message ${messageId}`;
  }
}
