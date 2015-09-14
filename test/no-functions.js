var assert = require('assert');
var common = require('./util/common.js');
var Understudy = require('../').Understudy;

var actor = new Understudy();

actor.before('no-functions', function () {
  throw new Error('before shouldn\'t be reached');
});

assert.throws(function () {
  actor.perform('no-functions', 'INVALID ACTION', 'INVALID CALLBACK');
}, function (err) {
  return err.message == 'last argument must be a function';
});

assert.throws(function () {
  actor.perform('no-functions', function () {}, 'INVALID CALLBACK');
}, function (err) {
  return err.message == 'last argument must be a function';
});
