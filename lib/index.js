/*
 Simple pattern for deferable events, when you want an action to be interruptable

 action - string
 args... - anything
 callback - once all deferences are finished call this function

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

function noop() {}

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

function perform(action /* , args..., callback, onFinish*/) {
  if (typeof action !== 'string') throw new Error('event must be a string');
  var onFinish = arguments[arguments.length - 1];
  var callback = arguments[arguments.length - 2];
  if (typeof callback !== 'function') throw new Error('callback and onFinish must be a function');
  var args = Array.prototype.slice.call(arguments, 0, -2);
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
    var l = interceptors.length;
    function nextInterceptor() {
      if (arguments[0]) {
         i = l;
      }
      if (i === l) {
        i++;
        after.apply(self, arguments);
      }
      else if (i < l) {
        var used = false;
        var interceptor = interceptors[i++];
        interceptor.apply(self, Array.prototype.slice.call(arguments, 1).concat(function next() {
          //
          // Do not allow multiple continuations
          //
          if (used) return;
          used = true;
          nextInterceptor.apply(null, arguments);
        }));
      }
    }
    nextInterceptor.apply(self, args);
  }
  function finish(err) {
    // TODO: Is this the most optimized way to do this?
    var self = this;
    if (err) {
      onFinish.apply(this, arguments);
    } else {
      var args = Array.prototype.slice.call(arguments, 1);
      args.push(function afterPerform(err) {
        if (err) {
          onFinish.apply(self, arguments);
        } else {
          iterate(self, self._after_interceptors && self._after_interceptors[action], arguments, onFinish);
        }
      });
      callback.apply(this, args)
    }

  }
  iterate(this, this._before_interceptors && this._before_interceptors[action], args, finish || noop);
  return this;
}
