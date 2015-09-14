var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();

actor.before('no-functions', function () {
  throw new Error('before shouldn\'t be reached');
});

actor.after('no-functions', function () {
  throw new Error('after shouldn\'t be reached');
});

assert.throws(function () {
  actor.perform('no-functions', 'INVALID ACTION', 'INVALID CALLBACK');
}, /last argument must be a function/);

assert.throws(function () {
  function action () {
  	throw new Error('action shouldn\'t be reached');
  }
  actor.perform('no-functions', action, 'INVALID CALLBACK');
}, /last argument must be a function/);
