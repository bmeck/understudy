/*
 Simple pattern for deferable events, when you want an action to be interruptable

 action - string
 args... - anything
 callback - once all deferences are finished call this function

*/
var _after_interceptors_registrar = registrar('_after_interceptors');
var _before_interceptors_registrar = registrar('_before_interceptors');
exports.Understudy = function() {
  this.perform = perform;
  this.after = _after_interceptors_registrar;
  this.before = _before_interceptors_registrar;
  this._before_interceptors = null;
  this._after_interceptors = null;
  return this;
}

function registrar(property) {
  var lifecycle = function (action, callback) {
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
  lifecycle.remove = function (action, callback) {
    if (!this[property]) return false;
    var index = self[property].indexOf(callback);
    if (index === -1) return false;
    this[property].splice(index, 1);
    if (this[property].length === 0) {
      this[property] = null;
    }
    return true;
  }
  return lifecycle;
}

function perform(action /* , args..., callback */) {
  if (typeof action !== 'string') throw new Error('event must be a string');
  var callback = arguments[arguments.length - 1];
  var args = Array.prototype.slice.call(arguments, 1, -1);
  //
  // Error first help
  //
  args.unshift(null);
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
    function next(err) {
      if (err) {
        i = l + 1;
        after && after.apply(self, arguments);
      }
      else if (i === l) {
        l++;
        after && after.apply(self, arguments);
      }
      else if (i < l) {
        var used = false;
        interceptors[i++].apply(self, Array.prototype.slice.call(arguments, 1).concat(function () {
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
    iterate(this, this._after_interceptors && this._after_interceptors[action], arguments, null);
  }
  iterate(this, this._before_interceptors && this._before_interceptors[action], args, finish);
  return this;
}
