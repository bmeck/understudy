var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();
var assertion = common.mustCall(function (a, b, next) {
  assert.equal(a, b);
  next();
}, 1);

actor.before('no-callback', assertion);
actor.after('no-callback', common.mustCall(function (a, next) {
  assert.equal(a, 'LOL');
  next()
}, 1));
actor.perform('no-callback', 'EQUAL', 'EQUAL', function (done) {
  done(null, 'LOL');
});

actor.before('no-callback-error', common.mustCall(function (a, b, next) {
  assert.equal(a, b);
  next('ERROR');
}, 1));

actor.after('no-callback-error', common.mustCall(function (res, next) {
  assert.equal(res, 'RESULT');
  next('ERROR');
}, 1));

actor.perform('no-callback-error', 'EQUAL', 'EQUAL', function (done) {
  done(null, 'RESULT');
});
