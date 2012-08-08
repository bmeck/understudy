//
// Limit unauthorized requests to one per 15 minutes per IP
//
//
// Prune up to 10,000 dangling clients (clients that have exceeded lockout period) every 10 minutes
//
var rate = module.exports;
rate.name = 'rate-limiter';
rate.init = function (done) {
   var clients = {};
   this.before('http.handler', function (req, res, next) {
      if (req.authorization) {
         next(req, res);
         return;
      }
      var client = clients[req.connection.remoteAddress] || (clients[req.connection.remoteAddress] = {});
      var now = Date.now();
      if (client.mtime != null) {
         var timeElapsed = now - client.mtime;
         if (timeElapsed < 1000 * 60 * 15) {
            res.json(429, {message:'Please try again in ' + ((1000 * 60 * 15 - timeElapsed)/(1000*60)) + ' minutes' });
         }
      }
      client.mtime = now;
      next(req, res);
   });
   setInterval(function () {
      var pruned = 0;
      var pruneTime = Date.now() - 1000 * 60 * 15;
      for (key in clients) {
         var client = clients[key];
         if (client.mtime < pruneTime) {
            delete clients[key];
            pruned++;
         }
         if (pruned > 1000 * 10) {
            break;
         }
      }
   },1000 * 60 * 10);
   done();
}