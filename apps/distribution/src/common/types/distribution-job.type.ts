export interface DistributionJob {
  id: string; 
  queue: string;
  type: string;
  attemptsMade: number;
  metadata: any;
  payload: any;
  addedAt: Date | string;
  processedAt: Date;
  finishedAt: Date;
}