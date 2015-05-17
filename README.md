# Understudy

A means to provide interceptors (i.e. hooks) when performing asynchronous actions.

## Goals

* **All hooks are asynchronous**
* * All logic done by `perform`-based actions is asynchronous.
* * Error first helpers.
* * Fail fast.

* **Consistency in arguments provided to hooks & actions**
* * Hooks can only mutate arguments that they are passed, not the number of arguments.
* * Use of callback arguments to pass information removes focus on return values to mitigate this potentially odd behavior.

* **Opt-in behavior.**
* * Only calls to `.perform(action ...` enable hooking.

## Usage

``` js
var Understudy = require('understudy');

var App = module.exports = function App() {
  Understudy.call(this);
};

//
// Starts the application after running before and
// after hooks.
//
App.prototype.start = function (options, callback) {
  this.perform('start', options, function (next) {
    //
    // Here, `options` may have been mutated from the execution
    // of the before hooks.
    // ...
    // Do some other async thing
    // ...
    // These arguments are passed to the final callback unless
    // short-circuited by an error here, or in an after hook.
    //
    next(null, options);
  }, callback);
};

App.prototype.handle = function (req, res) {
  req.times = {
    start: process.hrtime()
  };

  this.perform('http:request', req, res, function (next) {
    req.times.middle = process.hrtime();
    req.times.begin  = process.hrtime(req.times.start);
    next();
  }, function (err) {
    if (err) {
      //
      // Do some error handling.
      //
    }

    req.times.total = process.hrtime(req.times.start);
    req.times.after = process.hrtime(req.times.middle);
    console.log([
      'Total time: %s',
      '  Before hooks: %s',
      '  After  hooks: %s'
    ].join('\n'), format(req.times.total), format(req.times.begin), format(req.times.after));

    res.end();
  });
}

//
// Now we consume a new app with hooks.
//
var http = require('http');

var app = new App();
app.before('start', function (options, next) {
  var server = options.server = http.createServer(function (req, res) {
    app.handle(req, res);
  });

  server.listen(options.port, next);
});

app.after('start', function (options, next) {
  console.log('App started on %s', options.port);
});

app.before('http:request', function (req, res, next) {
  //
  // Do something asynchronous.
  //
  next();
});

app.start({ port: 8080 }, function () {
  console.log('ok');
});


//
// Format process.hrtime()
//
function format(s) {
  return (s[0] * 1e3 + s[1] / 1e6) / 1e3;
}
```

## API Documentation

#### `.perform(action, arg0, /* arg1, ... */, work, callback)`

This is the core API for invoking hooks provided by `Understudy`. Each call to `perform` for the same `action` should have a consistent argument signature because this is what will be expected by each of the before and after hooks for the `action`. The overall flow control is:

1. Call all `before` hooks for `action`.
2. Call `work` function for `action`.
3. Call all `after hooks for `action`.
4. Call `callback` with results from `work` function.

#### `.before(action, arg0, /* arg1, ... */, next)

Called before the `work` function is executed in perform with _exactly_ the arguments passed to `.perform`. Nothing passed to `next` have an impact on the flow control above **except any error is supplied short-circuits execution to the callback.**

#### `.after(action, arg0, /* arg1, ... */, next)

Called after the `work` function is executed in perform with _exactly_ the arguments passed to `.perform`. Nothing passed to `next` have an impact on the flow control above **except any error is supplied short-circuits execution to the callback.**

## Examples

See the example directory

##### LICENSE: MIT
##### Author: [Bradley Meck](https://github.com/bmeck)
##### Contributors: [Jarrett Cruger](https://github.com/jcrugzz), [Charlie Robbins](https://github.com/indexzero)
