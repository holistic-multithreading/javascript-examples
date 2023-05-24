
import pkg from "benchmark";
// import sum from "./Sum.js";

// const { checkSum } = sum;
const { Suite } = pkg;
var suite = new Suite;

function checkSum(range) {
    let sum = 0;
    for (let i = 0; i < range; i++) {
        sum += i % 10;
    }
    return sum;
}


suite.add('thousand', function() {
  checkSum(1000)
})
.add('million', function() {
  checkSum(1000000)
})
.add('billion', function() {
  checkSum(1000000000);
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  // console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run({ 'async': true });
