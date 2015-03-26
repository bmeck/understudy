var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();

actor.before('no-functions', function () {
  assert.equal(true, false);
});

actor.after('no-functions', function () {
  assert.equal(true, false);
});

assert.throws(function () {
  actor.perform('no-functions', 'NO', 'AFTER');
});
