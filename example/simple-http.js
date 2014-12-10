var Understudy = require('..');

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
