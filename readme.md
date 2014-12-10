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
actor.perform('load:plugins', config, function (config, next) {
  // start up app
  // ...
  // Config is loaded
  // ...
  // Do some other async thing
  // ...
  // These arguments are passed to the after hooks unless short-circuited by an
  // error here
  next(null, config)
}, function (err) {
  // Handle all errors and continue!
});
```

### before/after(action, interceptor) arguments

`action` - name of the action

`interceptor` - function to fire during action


### perform(action, ...args, performFn, onFinish) arguments

`action` - name of the action

`...args` - any arguments to send

`performFn` - function to fire once all before deferences have finished

`onFinish` - functon to fire once all after deferences have finished


### action started

1. The actor will start performing an "action" with `...args`.
2. At the end of the arguments to the event will be added a `next` function.
2. 1. The `next` function is used for passing state via arguments and accepts an error first argument in order to fail fast.
3. Each before interceptors will be fired in order after the previous fires the `next` function.
4. After all interceptors have been fired the `peformFn` function will fire with the arguments passed to the next function.
4. 1. The `next` function found in the `performFn` is used to pass arguments and needs to be called before the after hooks execute
5. If no errors have been passed, the after interceptors are executed which pre-empt the execution of the final `onFinish` callback

## Examples

See the example directory
