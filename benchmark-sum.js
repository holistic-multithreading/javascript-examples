
import pkg from "benchmark";
import os from "os";
import { Worker } from "worker_threads";

const { Suite } = pkg;
const suite = new Suite;

suite.add('thousand', function() {
  checkSum(1, 1_000)
})
  .add('million', function() {
    checkSum(1, 1_000_000)
  })
  .add('billion', function() {
    checkSum(1, 1_000_000_000);
  })
  .add('multithread_thousand', {
    defer: true,
    fn: async function(deferred) {
      await checkSumThreads(1, 1_000);
      deferred.resolve();
    }
  })
  .add('multithread_million', {
    defer: true,
    fn: async function(deferred) {
      await checkSumThreads(1, 1_000_000);
      deferred.resolve();
    }
  })
  .add('multithread_billion', {
    defer: true,
    fn: async function(deferred) {
      await checkSumThreads(1, 1_000_000_000);
      deferred.resolve();
    }
  })
  .on('start', function() {
    console.debug("Running benchmarks on %i CPUs: %o", os.cpus().length, os.cpus());
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    // console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });

async function checkSumThreads(lo, hi) {
  const threadCount = os.cpus().length;
  const batchSize = Math.floor((hi - lo + 1) / threadCount);
  let start = lo;
  const promises = [];
  for (let i = 0; i < threadCount - 1; i++) {
    let end = start + batchSize - 1;
    promises.push(createPromise({ lo: start, hi: end }));
    start = end + 1;
  }
  promises.push(createPromise({ lo: start, hi: hi }));

  return Promise.all(promises).then((values) => {
    let sum = 0;
    values.forEach(num => { sum += num });
    return sum;
  });
}

function createPromise(numberRange) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js");
    worker.postMessage({ min: numberRange.lo, max: numberRange.hi });
    worker.once('message', res => {
      worker.terminate();
      resolve(res);
    });
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

function checkSum(lo, hi) {
  let sum = 0;
  for (let i = lo; i <= hi; i++) {
    sum += i % 10;
  }
  return sum;
}
