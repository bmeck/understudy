//
// Usage:
//   node app.js --plugins ./plugins/response-time.js  --plugins ./plugins/rate-limit.js
//     --unauthorized.ok to allow unauthorized requests
//     --unauthorized.default abc will default the authorization to 'abc'
//

var fs = require('fs');
var path = require('path');
var flatiron = require('flatiron');
var Understudy = require('../../').Understudy;

var app = Understudy.call(flatiron.app);
app.config.argv().file('config.json').env();
app.use(require('./pluggable'));

app.use(flatiron.plugins.http);
function workflow(next) {
   app.perform('http.request', this.req, this.res, function (err, req, res, cleanup) {
      res.on('end', cleanup.bind(null, req, res));
      function handle() {
         app.perform('http.handler', req, res, function (err, req, res, cleanup) {
            next();
            cleanup(req, res);
         });
      }
      app.perform('http.authorization', req, res, function (err, req, res, cleanup) {
         if (req.authorization) {
            handle();
         }
         else {
            if (this.config.get('unauthorized:ok')) {
               req.authorization = this.config.get('unauthorized:default');
               handle();
            }
            else {
               res.json(403);
            }
         }
         cleanup(req, res);
      });
   });
}
app.router.every.before = workflow;
app.router.notfound = function () {
   workflow.call(this, function () {});
}
app.router.get('/auth', function (req, res) {
   this.res.json(200, this.req.authorization);
});

app.start(9090);