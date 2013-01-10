var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();
actor.perform('simple-test', 'FIRST', 'SECOND', common.mustCall(function defaultAction(err, a, b) {
   assert.equal(a, 'FIRST');
   assert.equal(b, 'SECOND');
   assert.equal(arguments.length, 3);
   assert.equal(err, null);
}, 1));