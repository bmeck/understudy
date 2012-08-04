var flatiron = require('flatiron');
var Understudy = require('../../').Understudy;

var app = Understudy.call(flatiron.app);
app.config.argv().file('config.json').env();

var request = require('request');
//
// SSO integration example
//
app.during('http.authorization', function (req, res, next) {
   request({
      url: 'https://api.nodejitsu.com/auth',
      headers: req.headers
   }, function (err, res) {
      if (res.statusCode === 200) {
         next(req.headers.authorization);
      }
      else {
         next();
      }
   });
});

app.use(flatiron.plugins.http);
function auth(next) {
   var req = this.req;
   var res = this.res;
   app.perform('http.authorization', req, res, function (authorization) {
      if (authorization) {
         req.authorization = authorization;
         next();
      }
      else {
         if (this.config.get('unauthorized:ok')) {
            req.authorization = this.config.get('unauthorized:default');
            next();
         }
         else {
            res.json(403);
         }
      }
   });
}
app.router.every.before = auth;
app.router.get('/auth', function () {
   this.res.json(200, req.authorization);
})

app.start(9090);
