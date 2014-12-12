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
  this.perform = perform;
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

function perform(action /* , args..., performFn, callback*/) {
  if (typeof action !== 'string') throw new Error('event must be a string');
  var callback = arguments[arguments.length - 1];
  var performFn = arguments[arguments.length - 2];
  if (typeof performFn !== 'function' || typeof callback !== 'function') {
    throw new Error('performFn and callback must be a function');
  }

  //
  // Get "arguments" Array and drop the first since that
  // is the action which is not needed in the hooks.
  //
  var args = Array.prototype.slice.call(arguments, 1, -2);

  //
  // This is called in multiple temporal localities, put into a function instead of inline
  // minor speed loss for more maintainability
  //
  function iterate(interceptors, args, after) {
    args = args.slice();
    if (!interceptors) {
      after.apply(null, args);
      return;
    }

    interceptors = interceptors.concat();
    var i = 0;
    var len = interceptors.length;
    if (!len) {
      after.apply(null, args);
      return;
    }

    function nextInterceptor() {
      if (i === len) {
        i++;
        after.apply(null, args);
      }
      else if (i < len) {
        var interceptor = interceptors[i++];
        interceptor.apply(null, args);
      }
    }

    args.push(function next(err) {
      if (!err) {
        nextInterceptor();
      } else {
        after(err);
      }
    });

    nextInterceptor();
  }

  //
  // Remark (jcrugzz): Is this the most optimized way to do this?
  //
  function executePerform(err) {
    var self = this;
    if (err) {
      callback(err);
    } else {
      //
      // Remark (indexzero): Should we console.warn if `arguments.length > 1` here?
      //
      performFn(function afterPerform(err) {
        var performArgs;
        if (err) {
          callback(err);
        } else {
          performArgs = Array.prototype.slice.call(arguments);
          iterate(self._after_interceptors && self._after_interceptors[action], args, function (err) {
            if (err) {
              callback(err);
            } else {
              callback.apply(null, performArgs);
            }
          });
        }
      })
    }
  }

  iterate(this._before_interceptors && this._before_interceptors[action], args, executePerform);
  return this;
}
