var Understudy = require('..');
var benchmark = require('benchmark');

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

var tests = {
  noHooks: new NoHooks(),
  yesHooks: new YesHooks()
};

function testThing(thing, n, next) {
  var completed = 0;
  function checkDone() {
    completed++;
    if (completed === n) {
      next();
    }
  }

  for (var i = 0; i < n; i++) {
    thing.method(checkDone);
  }
}

function testAtN(n) {
  console.log('Comparing at %s', n);
  var suite = new benchmark.Suite();

  suite.add('NoHooks', function nohooks1() {
    testThing(tests.noHooks, n, function () { })
  }).add('YesHooks', function nohooks1() {
    testThing(tests.yesHooks, n, function () { })
  }).on('cycle', function cycle(e) {
    var details = e.target;

    console.log('Finished benchmarking: "%s"', details.name);
    console.log('Count (%d), Cycles (%d), Elapsed (%d), Hz (%d)'
      , details.count
      , details.cycles
      , details.times.elapsed
      , details.hz
    );
  }).on('complete', function completed() {
    console.log('Benchmark: "%s" is the fastest.'
      , this.filter('fastest').pluck('name')
    );
  }).run();

}


testAtN(100000)
