var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();
actor.perform('simple-test', 'FIRST', 'SECOND', common.mustCall(function defaultAction(a, b, next) {
   assert.equal(a, 'FIRST');
   assert.equal(b, 'SECOND');
   assert.equal(arguments.length, 3);
   assert.equal(typeof next, 'function');
   next(null, a, b);
}, 1), common.mustCall(function onFinish (err, a, b) {
   assert.equal(err, null);
   assert.equal(a, 'FIRST');
   assert.equal(b, 'SECOND');
}, 1));
