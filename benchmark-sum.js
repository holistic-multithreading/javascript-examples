
import pkg from "benchmark";
import os from "os";
import pools from "node-worker-threads-pool";

const { Suite } = pkg;
const { StaticPool } = pools;

const suite = new Suite;

function checkSum(lo, hi) {
  let sum = 0;
  for (let i = lo; i <= hi; i++) {
    sum += i % 10;
  }
  return sum;
}

async function checkSumThreads(lo, hi) {
  const threadCount = os.cpus().length;
  const batchSize = Math.floor((hi - lo + 1) / threadCount);
  let start = lo;
  const promises = [];
  const pool = new StaticPool({ size: threadCount, task: "./worker.js" });
  for (let i = 0; i < threadCount - 1; i++) {
    let end = start + batchSize - 1;
    promises.push(pool.exec({ min: start, max: end }));
    start = end + 1;
  }
  promises.push(pool.exec({ min: start, max: hi }));

  return Promise.all(promises).then((values) => {
    let sum = 0;
    values.forEach(num => { sum += num });
    pool.destroy();
    return sum;
  });
}

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
