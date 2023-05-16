import { ConsumeMessage } from 'amqplib';

/**
 * Yields a number representing the attempts to process a message from a
 * queue.
 * @param {ConsumeMessage} amqpMsg
 * @param {string} queue
 * @returns {number}
 */
export function getAttempts(amqpMsg: ConsumeMessage, queue: string): number {
  const headers = amqpMsg.properties.headers;
  const queueHeader = headers['x-death']?.find(
    (header) => header.queue === queue,
  );

  return queueHeader ? queueHeader.count + 1 : 1;
}
