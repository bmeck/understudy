var Understudy = require('../');
var accounting = require('accounting');

var LEN = 1e7;

function ops_per_sec(s) {
  return accounting.format(LEN / format(s));
}

function format(s) {
  return ((s[0] * 1e3 + s[1] / 1e6) / 1e3).toFixed(2);
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
      var end = process.hrtime(start);
      console.log(' completed in %ss, op/s %s', format(end), ops_per_sec(end));
      next();
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

  testThing(tests.noHooks, 'noHooks', n, function () {
    testThing(tests.yesHooks, 'yesHooks', n, function () {
      console.log('Done!');
    });
  });
}

compareThing(1000000);
compareThing(100000);
compareThing(10000);
compareThing(1000);
