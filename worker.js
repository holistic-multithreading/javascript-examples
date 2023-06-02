import wrkr from "worker_threads";

const { parentPort } = wrkr;

parentPort.on('message', (param) => {
  // console.log(JSON.stringify(param));
  const { min, max } = param;
  parentPort.postMessage(checkSum(min, max));
});

function checkSum(lo, hi) {
  let sum = 0;
  for (let i = lo; i <= hi; i++) {
    sum += i % 10;
  }
  return sum;
}
