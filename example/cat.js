#!/usr/bin/env node
//
// printf 'wait 6.28' | node cat.js
// Script takes in a stream via stdin, buffers, waits if the data tells it to via `wait #` where # is the number of seconds to wait
//
var Understudy = require('../lib/index.js').Understudy;

//
// Data for our interruptable events
//
var interpretter = new Understudy();
var data = '';

//
// Buffering logic
//
function buffer (buff) {
  data += buff;
}
process.stdin.on('data', buffer)

//
// Interceptor that makes a delay if told to by data
//
interpretter.during('data', function (data, next) {
  var shouldwait = (data + '').match(/^wait (\d+(?:\.\d+)?|(\.\d+))$/i);
  //
  // See if we should wait
  //
  if (shouldwait) {
    //
    // Add us to the line of things to do
    //
    var wait = +(shouldwait[1]);
    setTimeout(function () {
      //
      // Pass in our new arguments
      //
      next('I waited for', wait, 'seconds');
    }, wait * 1000);
  }
  else {
    next();
  }
});

process.stdin.on('end', function () {
  //
  // Arguments are passed into final callback via postpone()'s result
  //
  interpretter.perform('data', data, console.log);
});

//
// Start up the stream
//
process.stdin.resume();
