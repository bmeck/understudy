/*
 * index.js: Simple pattern for deferable events, when you want an action to be interruptable
 *
 * action - string
 * args... - anything
 * performFn - once all "before" deferences are done call this function,
 *             then call all "after" deferences.
 * onFinish - once all "after" deferences are done call this function.
 *
 */
module.exports = Understudy;
module.exports.Understudy = Understudy;

function Understudy() {
  this.perform = performer(false);
  this.waterfall = performer(true);
  this.after = registrar('_after_interceptors');
  this.before = registrar('_before_interceptors');
  this._before_interceptors = null;
  this._after_interceptors = null;
  return this;
}

function registrar(property) {
  return function (action, callback) {
    if (typeof action === 'string') {
      if (typeof callback === 'function') {
        this[property] || (this[property] = {});
        this[property][action] || (this[property][action] = []);
        var interceptors = this[property][action];
        interceptors[interceptors.length] = callback;
        return this;
      }
      else {
        throw new Error('callback must be a function');
      }
    }
    throw new Error('event must be a string');
  }
}


function performer(waterfall) {
  return function perform(action /* , args..., performFn, callback*/) {

    if (typeof action !== 'string') throw new Error('event must be a string');
    var callback = arguments[arguments.length - 1];
    var performFn = arguments[arguments.length - 2];
    var slice = -2;
    if (typeof performFn !== 'function') {
      if (typeof callback !== 'function') {
        throw new Error('performFn and callback must be a function');
      }

      performFn = callback;
      callback = null;
      slice = -1;
    }

    //
    // Get "arguments" Array and set first to null to indicate
    // to nextInterceptor that there is no error.
    //
    var args = Array.prototype.slice.call(arguments, 0, slice);
    args[0] = null;

    //
    // This is called in multiple temporal localities, put into a function instead of inline
    // minor speed loss for more maintainability
    //
    function iterate(self, interceptors, args, after) {
      if (!interceptors) {
        after.apply(self, args);
        return;
      }

      interceptors = interceptors.concat();
      var i = 0;
      var len = interceptors.length;
      if (!len) {
        after.apply(self, args);
        return;
      }

      function nextInterceptor() {
        if (i === len) {
          i++;
          after.apply(self, arguments);
        }
        else if (i < len) {
          var used = false;
          var interceptor = interceptors[i++];
          interceptor.apply(self, Array.prototype.slice.call(arguments, 1).concat(function next(err) {
            //
            // Do not allow multiple continuations
            //
            if (used) { return; }

            used = true;
            if (!err || !callback) {
              nextInterceptor.apply(null, waterfall ? arguments : args);
            } else {
              after.call(self, err);
            }
          }));
        }
      }
      nextInterceptor.apply(null, args);
    }

    //
    // Remark (jcrugzz): Is this the most optimized way to do this?
    //
    function executePerform(err) {
      var self = this;
      if (err && callback) {
        callback.call(this, err);
      } else {
        //
        // Remark (indexzero): Should we console.warn if `arguments.length > 1` here?
        //
        performFn.call(this, function afterPerform(err) {
          var performArgs, afterArgs;
          if (err && callback) {
            callback.call(self, err);
          } else {

            //
            // Specifically for the `after` hooks, we call it with the result of
            // the perform function to be able to do any modifications to the
            // result of the work!
            //
            performArgs = Array.prototype.slice.call(arguments);
            //
            // If we are waterfalling we need to pass the performArgs
            //
            afterArgs = waterfall ? performArgs : args;
            iterate(self, self._after_interceptors && self._after_interceptors[action], afterArgs, function (err) {
              if (err && callback) {
                callback.call(self, err);
              } else if (callback) {
                //
                // Just to be sure we dont get javascript mad with object
                // references, we check the length of the arguments to see if
                // there is one, if not we default to whatever the performArgs.
                // Remark: I want to note here that each c
                //
                return arguments.length > 1 && waterfall
                  ? callback.apply(self, arguments)
                  : callback.apply(self, performArgs);
                }
            });
          }
        })
      }
    }

    //
    // Special flag for `isAfter`
    //
    iterate(this, this._before_interceptors && this._before_interceptors[action], args, executePerform);
    return this;
  }
}
