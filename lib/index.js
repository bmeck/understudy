/*
 Simple pattern for deferable events, when you want an action to be interruptable

 action - string
 args... - anything
 callback - once all deferences are finished call this function

*/
exports.Understudy = function() {
  this.perform = perform;
  this.during = during;
  this._interceptors = {};
  return this;
}

function during(action, callback) {
  if (typeof action === 'string') {
    if (typeof callback === 'function') {
      this._interceptors || (this._interceptors = {});
      this._interceptors[action] || (this._interceptors[action] = []);
      var interceptors = this._interceptors[action];
      interceptors[interceptors.length] = callback;
      return this;
    }
    else {
      throw new Error('callback must be a function');
    }
  }
  throw new Error('event must be a string');
}

function perform(action /* , args..., callback */) {
  if (typeof action === 'string') {
    var callback = arguments[arguments.length - 1];
    if (typeof callback === 'function') {
      if (this._interceptors) {
        var self = this;
        var interceptors = this._interceptors[action];
        if (interceptors) {
          //
          // Copy the interceptors to prevent registration loops
          //
          interceptors = interceptors.concat();
          //
          // Get arguments for intercept(...)
          //
          var args = Array.prototype.slice.call(arguments, 1, -1);
          //
          // Replace the callback with a interceptor registration function
          //
          var i = 0;
          var l = interceptors.length;
          function next () {
            if (i === l) {
              i++;
              callback.apply(self, arguments);
            }
            else if (i < l) {
              var interceptor = interceptors[i++];
              var used = false;
              interceptor.apply(self, Array.prototype.slice.call(arguments).concat(function () {
                //
                // Do not allow multiple continuations
                //
                if (used) return;
                used = true;
                next.apply(null, arguments);
              }));
            }
          }
          next.apply(self, args);
        }
      }
      return this;
    }
    throw new Error('callback must be a function');
  }
  throw new Error('event must be a string');
}
