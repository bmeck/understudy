var assert = require('assert');
var toCallFunctions = [];
var toCallCounts = [];
var toCallCalls = [];

process.on('exit', function () {
  var errs = [];
  toCallCounts.forEach(function (count, index) {
    var calls = toCallCalls[index];
    var fn = toCallFunctions[index];
    if (count == null) {
      if (calls === 0) {
        errs.push('Expected ' + fn.name + ' function to be called but it never was');
      }
    }
    else if (count !== calls) {
      errs.push('Expected ' + fn.name + ' function to be called ' + count + ' times but it was called ' + calls + ' times' );
    }
  });

  if (errs.length) {
    throw new Error(errs.join('\n'));
  }
});

exports.mustCall = function (fn, count) {
  assert.equal(isNaN(count), false);
  var index = toCallFunctions.length;
  toCallFunctions.push(fn);
  toCallCounts.push(count);
  toCallCalls.push(0);
  return function () {
    toCallCalls[index]++;
    return fn.apply(this, arguments);
  };
};
