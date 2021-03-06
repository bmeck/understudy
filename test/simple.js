var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();
actor.before('simple-test', common.mustCall(function beforeAction(a, b, next) {
  assert.equal(a, 'FIRST');
  assert.equal(b, 'SECOND');
  assert.equal(arguments.length, 3);
  next();
}, 1));

actor.after('simple-test', common.mustCall(function afterAction(a, b, next) {
  assert.equal(a, 'FIRST');
  assert.equal(b, 'SECOND');
  assert.equal(arguments.length, 3);
  next();
}, 1));

actor.after('simple-test', common.mustCall(function afterActionLast(a, b, next) {
  assert.equal(a, 'FIRST');
  assert.equal(b, 'SECOND');
  assert.equal(arguments.length, 3);
  next();
}, 1));

actor.after('*', common.mustCall(function afterActionLast(a, b, next) {
  assert.equal(a, 'FIRST');
  assert.equal(b, 'SECOND');
  assert.equal(arguments.length, 3);
  next();
}, 1));

actor.perform(
  'simple-test', 'FIRST', 'SECOND',
  common.mustCall(function defaultAction(next) {
    assert.equal(arguments.length, 1);
    assert.equal(typeof next, 'function');
    next(null, 'ARG1', 'ARG2');
  }, 1),
  common.mustCall(function onFinish(err, one, two) {
    assert.equal(err, null);
    assert.equal(one, 'ARG1');
    assert.equal(two, 'ARG2');
  }, 1)
);
