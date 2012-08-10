/*
 Simple pattern for deferable events, when you want an action to be interruptable

 action - string
 args... - anything
 callback - once all deferences are finished call this function

*/
exports.Understudy = function() {
  this.perform = perform;
  this.after = after;
  this.before = before;
  this._before_interceptors = null;
  this._after_interceptors = null;
  return this;
}

function before(action, callback) {
  if (typeof action === 'string') {
    if (typeof callback === 'function') {
      this._before_interceptors || (this._before_interceptors = {});
      this._before_interceptors[action] || (this._before_interceptors[action] = []);
      var interceptors = this._before_interceptors[action];
      interceptors[interceptors.length] = callback;
      return this;
    }
    else {
      throw new Error('callback must be a function');
    }
  }
  throw new Error('event must be a string');
}

function after(action, callback) {
  if (typeof action === 'string') {
    if (typeof callback === 'function') {
      this._after_interceptors || (this._after_interceptors = {});
      this._after_interceptors[action] || (this._after_interceptors[action] = []);
      var interceptors = this._after_interceptors[action];
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
    if (typeof callback === 'function' || (callback = function(){})) {
      var self = this;
      //
      // This is called in multiple temporal localities, put into a function instead of inline
      // minor speed loss for more maintainability
      //
      function performAfter() {
        interceptors = self._after_interceptors && self._after_interceptors[action];
        if (!interceptors) return;
        var i = 0;
        var l = interceptors.length;
        function next() {
          if (i !== l && i < l) {
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
        next.apply(self, arguments);
      }
      if (this._before_interceptors) {
        var interceptors = this._before_interceptors[action];
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
              i = 0;
              l = interceptors.length;
              callback.apply(self, Array.prototype.slice.call(arguments).concat(performAfter));
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
        else {
          callback.apply(this, Array.prototype.slice.call(arguments, 1, -1).concat(performAfter));
        }
      }
      else {
        callback.apply(this, Array.prototype.slice.call(arguments, 1, -1).concat(performAfter));
      }
      return this;
    }
    throw new Error('callback must be a function');
  }
  throw new Error('event must be a string');
}
