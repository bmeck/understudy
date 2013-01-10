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
   app.perform('http.request', this.req, this.res, function (err, req, res) {
      function handle(req, res) {
         app.perform('http.handler', req, res, function (err, req, res) {
            next();
         });
      }
      app.perform('http.authorization', req, res, function (err, req, res) {
         if (req.authorization) {
            handle.call(req, res);
         }
         else {
            if (this.config.get('unauthorized:ok')) {
               req.authorization = this.config.get('unauthorized:default');
               handle(req, res);
            }
            else {
               res.json(403);
            }
         }
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