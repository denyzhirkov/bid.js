import defaultConfig from './default-config';
import uid from './uid';
import {
  BidProcess,
  BidCallback,
  BidEvent,
  BidStatus,
  BidJob,
  BidProcessJob,
  Done,
  Progress,
  BidConfig,
} from './types';

export {
  BidProcess,
  BidCallback,
  BidEvent,
  BidStatus,
  BidJob,
  BidProcessJob,
  Done,
  Progress,
  BidConfig,
};

export default class Bid {
  protected events: any = {
    start: null,
    finish: null,
    error: null,
    end: null,
  };
  protected config: BidConfig;
  protected enumerate: number = 0;
  protected process: BidProcess;
  protected _status: BidStatus = BidStatus.IDLE;
  protected _jobs: BidJob[] = [];
  protected _timeout: NodeJS.Timeout | null = null;

  get status(): string {
    return this._status;
  }

  get jobs(): BidJob[] {
    return this._jobs;
  }

  constructor(config: BidConfig = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
  }

  protected setProgress = (job: BidJob): Progress => {
    return async (percent: number) => {
      if (percent >= 100) {
        await this.setDone(job)();
      } else {
        job.progress = percent;
      }
      return true;
    };
  };

  protected setDone = (job: BidJob): Done => {
    const { finish, error } = this.events;
    return async (err, result) => {
      job.done = err ? false : true;
      job.finished = +new Date();
      job.result = result;
      job.error = err;
      job.progress = err ? job.progress : 100;
      if (err) {
        if (error) {
          error({ ...job });
        }
      } else {
        if (finish) {
          finish({ ...job });
        }
      }
      this._status = BidStatus.IDLE;
      this.runWorker();
      return true;
    };
  };

  protected next = async (): Promise<BidJob | null> => {
    if (this._jobs.length) {
      return this._jobs.shift() || null;
    } else {
      return null;
    }
  };

  protected runWorker = (): void => {
    if (this._status === BidStatus.WORKING) {
      return;
    }
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    const job = this._jobs.shift();
    if (job) {
      this._status = BidStatus.WORKING;
      const progress = this.setProgress(job);
      const done = this.setDone(job);
      if (this.events.start) {
        this.events.start({ ...job });
      }
      this._timeout = setTimeout(() => {
        try {
          const processJob: BidProcessJob = {
            id: job.id,
            name: job.name,
            payload: job.payload,
            created: job.created,
          };
          this.process(processJob, progress, done);
        } catch (error) {
          if (this.events.error) {
            this.events.error({ ...job }, error);
          }
        }
      }, 0);
    } else {
      if (this.events.end) {
        this.events.end();
      }
    }
  };

  setProcess = (proc: BidProcess): Bid => {
    this.process = proc;
    return this;
  };

  on = (event: BidEvent, callback: BidCallback): Bid => {
    this.events[event] = callback;
    return this;
  };

  add = (payload: any, name?: string): Bid => {
    const id = this.config.enumerate ? (this.enumerate += 1) : uid();
    const job: BidJob = {
      id,
      name,
      done: false,
      finished: 0,
      created: +new Date(),
      progress: 0,
      payload,
      dead: false,
      error: null,
    };
    this._jobs.push(job);
    this.runWorker();
    return this;
  };
}
