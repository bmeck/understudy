var rtt = module.exports;
//
// Simple response time to log
//
rtt.name = 'http-response-time';
rtt.init = function (done) {
   var app = this;
   app.before('http.request', function (req, res, next) {
      var start = Date.now();
      res.on('end', function () {
         app.log.info(['responded in', Date.now() - start, 'ms'].join(' '));
      });
      next(null, req, res);
   });
   done();
}