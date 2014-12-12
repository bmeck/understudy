var Understudy = require('..');
var accounting = require('accounting');

function ops_per_sec(ops, s) {
  return (ops / format(s));
}

function format(s) {
  return ((s[0] * 1e3 + s[1] / 1e6) / 1e3);
}

var hooks = {
  before: function (opts, next) {
    opts.y = 4 + 5 + 6;
    next();
  },
  after: function (opts, next) {
    opts.z = 7 + 8 + 9;
    next();
  }
};

var underHooks = {
  before: function (opts, next) {
    opts.y = 4 + 5 + 6;
    next();
  },
  after: function (opts, next) {
    opts.z = 7 + 8 + 9;
    next();
  }
};


var NoHooks = function () {}
NoHooks.prototype.method = function (callback) {
  var opts = { x: 1 + 2 + 3 };
  hooks.before(opts, function () {
    hooks.after(opts, function () {
      opts.zz = 'a' + 'b' + 'c';
      callback();
    });
  });
};

var YesHooks = function () {
  Understudy.call(this);

  this.before('method', underHooks.before);
  this.after('method', underHooks.after);
}

YesHooks.prototype.method = function (callback) {
  var opts = { x: 1 + 2 + 3 };
  this.perform('method', opts, function (next) {
    opts.zz = 'a' + 'b' + 'c';
    next();
  }, callback);
}


var times = {};

function testThing(thing, key, n, next) {
  console.log('Starting with %s for %s times', key, accounting.format(n));
  var start = process.hrtime();

  var completed = 0;
  function checkDone() {
    completed++;
    if (completed === n) {
      var end = process.hrtime(start),
          elapsed = format(end);
          opsPerSec = ops_per_sec(n, end);

      console.log(
        ' completed in %ss, op/s %s',
        elapsed.toFixed(2),
        accounting.format(opsPerSec)
      );

      next({ elapsed: elapsed, opsPerSec: opsPerSec });
    }
  }

  for (var i = 0; i < n; i++) {
    thing.method(checkDone);
  }
}

function compareThing(n) {
  var tests = {
    noHooks: new NoHooks(),
    yesHooks: new YesHooks()
  };

  testThing(tests.noHooks, 'noHooks', n, function (noRes) {
    testThing(tests.yesHooks, 'yesHooks', n, function (yesRes) {
      console.log(
        'noHooks is %s times faster \n Done \n',
        (noRes.opsPerSec / yesRes.opsPerSec).toFixed(2)
      );
    });
  });
}

// console.log('Running benchmarks in silent mode to warmup jit');
// var log = console.log;
// console.log = function () {}
// compareThing(1000000);
// compareThing(100000);

// console.log = log;
// console.log('Not silent anymore...');

compareThing(1000000);
compareThing(100000);
