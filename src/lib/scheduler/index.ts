import { Worker } from 'worker_threads';
import Logger, { log } from '../logger';

export interface Job {
  id: string;

  started: boolean;
  logger: Logger;
}

export interface WorkerJob<Data = any> extends Job {
  path: string;
  data: Data;

  worker?: Worker;
}

export interface IntervalJob extends Job {
  interval: number;
  func: () => void;

  timeout?: NodeJS.Timeout;
}

export class Scheduler {
  private logger: Logger = log('scheduler');

  public constructor(public jobs: Job[] = []) {}

  public start(): void {
    this.logger.debug('starting scheduler', {
      jobs: this.jobs.length,
    });

    for (const job of this.jobs) {
      if (job.started) continue;

      job.logger = this.logger.c('jobs').c(job.id);

      if ('interval' in job) {
        this.startInterval(job as IntervalJob);
      } else if ('path' in job) {
        this.startWorker(job as WorkerJob);
      }
    }
  }

  private startInterval(job: IntervalJob) {
    if (job.interval === 0) {
      this.logger.debug('not starting interval', {
        id: job.id,
        interval: job.interval,
      });

      return;
    }

    job.started = true;

    const timeout = setInterval(job.func.bind(job), job.interval);
    job.timeout = timeout;

    this.logger.debug('started interval job', {
      id: job.id,
      interval: job.interval,
    });
  }

  private startWorker(job: WorkerJob) {
    job.started = true;

    const worker = new Worker(job.path, {
      workerData: job.data,
    });

    job.worker = worker;

    this.logger.debug('started worker job', {
      id: job.id,
    });
  }

  public addInterval(id: string, interval: number, func: () => void, start: boolean = false): void {
    const len = this.jobs.push({
      id,
      interval,
      func,
      started: false,
    } as IntervalJob);

    if (start) this.startInterval(this.jobs[len - 1] as IntervalJob);
  }

  public addWorker<Data = any>(id: string, path: string, data: Data, start: boolean = false): void {
    const len = this.jobs.push({
      id,
      path,
      data,
      started: false,
    } as WorkerJob<Data>);

    if (start) this.startWorker(this.jobs[len - 1] as WorkerJob<Data>);
  }
}