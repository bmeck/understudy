var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();
actor.before('simple-test', common.mustCall(function beforeAction(a, b, next) {
   assert.equal(arguments.length, 3);
   next('ERROR');
}, 1));

actor.before('simple-test', common.mustCall(function beforeActionSkipped(b, next) {}, 0));
actor.after('simple-test', common.mustCall(function afterAction(a, b, next) {}, 0));

actor.perform(
  'simple-test', 'FIRST', 'SECOND',
  common.mustCall(function defaultAction(next) {}, 0),
  common.mustCall(function onFinish(err) {
   assert.equal(err, 'ERROR');
  }, 1)
);
