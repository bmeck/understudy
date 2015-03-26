var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();

actor.before('no-after-no-call', common.mustCall(function afterAction(a, b, next) {
  assert.equal(a, 'NO');
  assert.equal(b, 'AFTER');
  assert.equal(arguments.length, 3);
  next();
}, 1));

actor.after('no-after-no-call', function (next) {
  assert.equal(true, false);
  next();
});

actor.perform('no-after-no-call', 'NO', 'AFTER', function (done) {
  assert.ok(true);
});

actor.before('no-after-call', common.mustCall(function afterAction(a, b, next) {
  assert.equal(a, 'NO');
  assert.equal(b, 'AFTER');
  assert.equal(arguments.length, 3);
  next();
}, 1));

actor.after('no-after-call', function (a, b, next) {
  assert.equal(true, false);
  next();
});

actor.perform('no-after-call', 'NO', 'AFTER', function (done) {
  assert.ok(true);
  done();
});
