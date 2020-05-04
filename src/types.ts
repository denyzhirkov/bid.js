export type BidEvent = 'start' | 'finish' | 'error' | 'end';
export enum BidStatus {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
}

export type BidConfig = {
  enumerate?: boolean;
  onAdd?: (payload: any, name?: string) => Promise<void>;
  next?: () => Promise<BidJob | null>;
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
