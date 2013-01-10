/*
 Simple pattern for deferable events, when you want an action to be interruptable

 action - string
 args... - anything
 callback - once all deferences are finished call this function

*/
exports.Understudy = function() {
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

function perform(action /* , args..., callback */) {
  if (typeof action !== 'string') throw new Error('event must be a string');
  var callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') throw new Error('callback must be a function');
  var args = Array.prototype.slice.call(arguments, 0, -1);
  args[0] = null;
  //
  // This is called in multiple temporal localities, put into a function instead of inline
  // minor speed loss for more maintainability
  //
  function iterate(self, interceptors, args, after) {
    if (!interceptors) {
      after && after.apply(self, args);
      return;
    }
    interceptors = interceptors.concat();
    var i = 0;
    var l = interceptors.length;
    function next() {
      if (arguments[0]) {
         i = l;
      }
      if (i === l) {
        i++;
        after && after.apply(self, arguments);
      }
      else if (i < l) {
        var used = false;
        var interceptor = interceptors[i++];
        interceptor.apply(self, Array.prototype.slice.call(arguments, 1).concat(function () {
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
  function finish() {
    callback && callback.apply(this, arguments);
    iterate(this, this._after_interceptors && this._after_interceptors[action], Array.prototype.slice.call(arguments), null);
  }
  iterate(this, this._before_interceptors && this._before_interceptors[action], args, finish);
  return this;
}

