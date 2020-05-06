
# Bid.js
**In-memory work queue**

## How to
### Install
```sh
npm i bid.js
```
### Import
```javascript
import Bid from 'bid.js'
```
### Use
```javascript
// Creating new instances of our queue
const bid = new Bid();

// Set up a process callback
bid.setProcess((job, progress, done) => {
  // ..Logic
  const result = 'The job is done!';
  done(null, result);
});

// Add your first payload for queue
bid.add({some: "payload"});
/*
By the way this payload appears in job.payload
*/
```

## API

### new Bid( config )
| option| default | what for |
| --- | --- | --- |
| config.enumerate | false | Enumerate job.id instead of random id |
| config.process | undefined | Callback function to handle the payload |

### Bid instance
| option| usage | what for |
| --- | --- | --- |
| bid.setProcess | callback(job, progress, done) | Set the process callback|
| bid.add | payload | Add new payload to queue |
| bid.on | ('start', cb(job)) | Callback event on every job was started |
| bid.on | ('finish', cb(job)) | Callback event on every job was finished |
| bid.on | ('error', cb(job)) | Callback event on job was done with error |
| bid.on | ('end', cb()) | Callback event on queue is ended |

### Job
| option| value | what for |
| --- | --- | --- |
| job.id | string/id number | Job unique/serial id |
| job.name? | undefined | Job string name |
| job.done | boolean | Is the job already done without error |
| job.finished | number | Unixtime job was finished |
| job.created | number | Unixtime job was created |
| job.progress | number | Job workflow progress percent |
| job.payload | any | Job payload |
| job.dead | boolean | Is job dead (timeout) |
| job.result | any | Job result with which it was finished ( done(error?, result?) ) |
| job.error | Error/string | Job error with which it was finished ( done(error?, result?) ) |

### More helpfull
Also try to use it with typescript, just import Bid with all the types it uses
```javascript
import Bid from 'bid.js'
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
  BidError,
} from  'bid.js';
```

### Tests
```sh
npm run test
```