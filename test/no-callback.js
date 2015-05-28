var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();

actor.before('no-callback', function (a, b) {
  assert.equal(a, b);
});

actor.after('no-callback', function (a, b) {
  assert.equal(a, b);
});

actor.perform('no-functions', 'EQUAL', 'EQUAL', function (done) {
  done();
});
