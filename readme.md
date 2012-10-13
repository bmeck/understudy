# Understudy

A means to provide interceptors when performing actions.

## Design Considerations

* Async

* * error first helpers

* * fail fast

* Modify input not output from functions
 
* * modification of output can lead to a function giving odd results that do not match documentation

* * use of callback arguments to pass information removes focus on return values to mitigate this potentially odd behavior
 
* Opt-in behavior.

## Usage

```
var actor = new (require('understudy').Understudy)();
function beforeHandler(config, next) {
  // load any plugins specified via config
  // ...
  next();
}
function afterHandler(config, next) {
  console.log('plugins have been loaded');
  next(config);
}
actor.before('load:plugins', beforeHandler);
actor.after('load:plugins', afterHandler);
actor.perform('load:plugins', config, function (err, config, allowAfter) {
  // start up app
  // ...
  // opt-in for `after` interceptors
  actor.before.remove('load:plugins', beforeHandler);
  allowAfter();
});
```

### before/after(action, interceptor) arguments

`action` - name of the action

`interceptor` - function to fire during action

### before.remove/after.remove(action, interceptor) arguments

`action` - name of the action

`interceptor` - function to remove from list of action handlers 

### perform(action, ...args, done) arguments

`action` - name of the action

`...args` - any arguments to send

`done` - callback to fire once all deferences have finished

### action started

1. The actor will start performing an "action" with `...args`.
2. At the end of the arguments to the event will be added a `next` function.
2. 1. The `next` function is used for passing state via arguments and accepts an error first argument in order to fail fast.
3. Each before interceptors will be fired in order after the previous fires the `next` function.
4. After all interceptors have been fired the `done` function will fire with the arguments passed to the next function and an opt-in function to allow after interceptors.
5. If the `done` function opts-in to after interceptors the after interceptors will be fired in order after the previous fires the `next` function.

## Examples

See the example directory