export type BidEvent = 'start' | 'finish' | 'error' | 'end';
export enum BidStatus {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
}

export enum BidError {
  NO_PROCESS = 'The "process" must be set up before running',
}

export type BidConfig = {
  enumerate?: boolean;
  process?: BidProcess;
};

export type BidJob = {
  name?: string;
  id: string | number;
  done: boolean;
  finished: number;
  created: number;
  progress: number;
  payload: any;
  dead: boolean;
  result?: any;
  error?: Error | string | null;
};

export type BidProcessJob = {
  name?: string;
  id: string | number;
  created: number;
  payload: any;
};

export type Progress = (percent: number) => Promise<boolean>;
export type Done = (error?: Error | string | null, result?: any) => Promise<boolean>;

export type BidProcess = (job: BidProcessJob, progress: Progress, done: Done) => void;
export type BidCallback = (job?: BidJob, error?: Error) => void;
