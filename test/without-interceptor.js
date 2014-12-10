var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();
actor.perform('simple-test', 'FIRST', 'SECOND', common.mustCall(function defaultAction(next) {
   assert.equal(arguments.length, 1);
   assert.equal(typeof next, 'function');
   next(null, 'THIRD', 'FOURTH');
}, 1), common.mustCall(function onFinish (err, c, d) {
   assert.equal(err, null);
   assert.equal(c, 'THIRD');
   assert.equal(d, 'FOURTH');
}, 1));
