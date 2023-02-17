import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';
import { ExpressAdapter } from '@bull-board/express';
import { INestApplication } from '@nestjs/common';
import { Queue } from 'bull';

export const queuePool = new Set<Queue>();

function getBullBoardQueues(): BaseAdapter[] {
  const adapters: BaseAdapter[] = [];

  for (const queue of queuePool) {
    adapters.push(new BullAdapter(queue));
  }

  return adapters;
}

export function setupBullBoard(app: INestApplication): void {
  const serverAdapter = new ExpressAdapter();
  const queues = getBullBoardQueues();

  serverAdapter.setBasePath('/queues/admin');
  app.use('/queues/admin', serverAdapter.getRouter());

  const { addQueue } = createBullBoard({ queues: [], serverAdapter });

  queues.forEach((queue) => addQueue(queue));
}
