var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();
var assertion = common.mustCall(function (a, b, next) {
  assert.equal(a, b);
  next();
}, 2);

actor.before('no-callback', assertion);
actor.after('no-callback', assertion);
actor.perform('no-callback', 'EQUAL', 'EQUAL', function (done) {
  done();
});

actor.before('no-callback-error', common.mustCall(function (a, b, next) {
  assert.equal(a, b);
  next('ERROR');
}, 1));

actor.after('no-callback-error', common.mustCall(function (a, b, next) {
  assert.equal(a, b);
  next('ERROR');
}, 1));

actor.perform('no-callback-error', 'EQUAL', 'EQUAL', function (done) {
  done();
});
