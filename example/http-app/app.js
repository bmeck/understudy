var flatiron = require('flatiron');
var Understudy = require('../../').Understudy;

var app = Understudy.call(flatiron.app);
app.config.argv().file('config.json').env();

var request = require('request');
//
// SSO integration example
//
app.before('http.authorization', function (req, res, next) {
   request({
      url: 'https://api.nodejitsu.com/auth',
      headers: req.headers
   }, function (err, sso_res) {
      if (sso_res.statusCode === 200) {
         req.authorization = req.headers.authorization;
      }
      next(req, res);
   });
});
app.after('http.authorization', function (req, res, next) {
   if (!req.authorized) {
      console.log('unauthorized', req.url, 'from', req.connection.remoteAddress);
   }
   next();
});

app.use(flatiron.plugins.http);
function auth(next) {
   app.perform('http.authorization', this.req, this.res, function (req, res, cleanup) {
      if (req.authorization) {
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
         cleanup(req, res);
      }
   });
}
app.router.every.before = auth;
app.router.get('/auth', function (req, res) {
   this.res.json(200, req.authorization);
})

app.start(9090);
