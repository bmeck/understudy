var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();
actor.before('simple-test', common.mustCall(function beforeAction(a, b, next) {
   assert.equal(arguments.length, 3);
   assert.equal(a, 'FIRST');
   assert.equal(b, 'SECOND');
   next(null, b);
}, 1));
actor.after('simple-test', common.mustCall(function afterAction(b, next) {
   assert.equal(b, 'SECOND');
   next();
}, 1));
actor.after('simple-test', common.mustCall(function afterActionLast(next) {
   assert.equal(arguments.length, 1);
   next();
}, 1));
actor.perform('simple-test', 'FIRST', 'SECOND', common.mustCall(function defaultAction(b, next) {
   assert.equal(b, 'SECOND');
   assert.equal(arguments.length, 2);
   assert.equal(typeof next, 'function');
   next(null, b);
}, 1), common.mustCall(function onFinish(err) {
   assert.equal(err, null);
}, 1));
