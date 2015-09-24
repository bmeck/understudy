var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();
actor.before('error-after', common.mustCall(function beforeAction(a, next) {
  assert.equal(a, 'FIRST');
  next(null, a);
}, 1));

actor.after('error-after', common.mustCall(function afterAction(a, next) {
  //
  // We get whats returned from perform here
  //
  assert.equal(a, 'RESULT');
  next('ERROR');
}, 1));

actor.after('error-after', common.mustCall(function afterSkipped(a, next) {}, 0));

actor.perform(
  'error-after', 'FIRST',
  common.mustCall(function perform (next) {
    assert(typeof next, 'function');
    next(null, 'RESULT');
  }, 1),
  common.mustCall(function onFinish (err) {
    assert.equal(err, 'ERROR');
  }, 1)
);

