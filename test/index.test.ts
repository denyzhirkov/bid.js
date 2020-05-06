import 
  Bid,
  { BidProcess, BidCallback, BidEvent, BidStatus, BidJob, BidProcessJob, Done, Progress, BidConfig, BidError }
from '../src';
import 'jest-extended';

const wait = async (t = 200) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(t), t)
  });
};

let testBid: Bid;

beforeEach(() => {
  testBid = new Bid();
});

test('Bid should execute "start" event', async () => {
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    await done();
  };
  const pass = jest.fn();

  testBid.on('start', () => {
    pass();
  });

  testBid.setProcess(proc);
  testBid.add(1);
  wait();
  await expect(pass).toBeCalledTimes(1);
});

test('Bid should execute "finish" event', async () => {
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    await done();
  };
  const pass = jest.fn();

  testBid.on('finish', () => {
    pass();
  });

  testBid.setProcess(proc);
  testBid.add(1);
  await wait();
  expect(pass).toBeCalledTimes(1);
});

test('Bid should execute "finish" event 5 times', async () => {
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    await wait(200);
    await done();
  };
  const pass = jest.fn();
  const passEnd = jest.fn();

  testBid.on('finish', pass);
  testBid.on('end', passEnd);

  testBid.setProcess(proc);
  testBid.add(1).add(1).add(1).add(1).add(1);
  await wait(1200);
  expect(pass).toBeCalledTimes(5);
});

test('Bid should execute "end" event', async () => {
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    await done();
  };
  const pass = jest.fn();

  testBid.on('end', () => {
    pass();
  });

  testBid.setProcess(proc);
  testBid.add(1);
  await wait();
  expect(pass).toBeCalledTimes(1);
});

test('Bid should execute "error" event', async () => {
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    try {
      throw 'nothing to do';
    } catch (error) {
      await done(error);
    }
  };
  const pass = jest.fn();

  testBid.on('error', () => {
    pass();
  });

  testBid.setProcess(proc);
  testBid.add(1);
  await wait();
  expect(pass).toBeCalledTimes(1);
});

test('Bid should execute all events in normal flow', async () => {
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    if (job.payload === 'error') {
      await done('fake error');
    } else {
      await done();
    }
  };
  
  const passStart = jest.fn();
  const passFinish = jest.fn();
  const passEnd = jest.fn();

  testBid.on('start', passStart);
  testBid.on('finish', passFinish);
  testBid.on('end', passEnd);

  testBid.setProcess(proc);
  testBid.add(1);
  await wait();
  expect(passStart).toHaveBeenCalledBefore(passFinish);
  expect(passFinish).toHaveBeenCalledBefore(passEnd);
});

test('Bid should execute all events in error flow', async () => {
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    if (job.payload === 'error') {
      await done('fake error');
    } else {
      await done();
    }
  };
  
  const passStart = jest.fn();
  const passError = jest.fn();
  const passEnd = jest.fn();

  testBid.on('start', passStart);
  testBid.on('error', passError);
  testBid.on('end', passEnd);

  testBid.setProcess(proc);
  testBid.add('error');
  await wait();
  expect(passStart).toHaveBeenCalledBefore(passError);
  expect(passError).toHaveBeenCalledBefore(passEnd);
});

test('Bid should increase amount of jobs', async () => {
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    wait(500);
    await done();
  };

  testBid.setProcess(proc);

  const onStart = testBid.jobs.length;
  expect(onStart).toBe(0);
  const onOne = testBid.add(1).jobs.length;
  expect(onOne).toBe(0);
  const onTwo = testBid.add(1).jobs.length;
  expect(onTwo).toBe(1);
  const onThree = testBid.add(1).jobs.length;
  expect(onThree).toBe(2);
});

test('Bid should fill job', async () => {
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    await wait();
    await done(null, {"all": "done"});
  };

  testBid.setProcess(proc);
  testBid.on('finish', (job: BidJob) => {
    expect(job.payload).toStrictEqual({"some": "payload"});
    expect(job.done).toBe(true);
    expect(job.progress).toBe(100);
    expect(job.result).toStrictEqual({"all": "done"});
    expect(job.finished).toBeGreaterThanOrEqual(finishTime);
    expect(job.id).toBeDefined();
    expect(job.error).toBe(null);
  });

  const finishTime = (+new Date());
  testBid.add({"some": "payload"});

});

test('Bid should enumerate job if config allow', async () => {
  const testBid = new Bid({
    enumerate: true
  });
  
  const proc: BidProcess = async (job: BidProcessJob, progress: Progress, done: Done) => {
    await wait();
    await done();
  };

  testBid.setProcess(proc);
  testBid.on('finish', (job: BidJob) => {
    expect(job.id).toBe(1);
  });

  testBid.add({"some": "payload"});

});

test('Bid should throw if no process', async () => {
  expect(() => {
    testBid.add({"some": "payload"});
  }).toThrow(BidError.NO_PROCESS);
});
