# Understudy

A means to provide interceptors when performing actions.

## Design Considerations

 * Modify input not output from functions
 ** modification of output can lead to a function giving odd results that do not match documentation
 ** use of callback arguments to pass information removes focus on return values to mitigate this potentially odd behavior
 * Opt-in behavior.

## Usage

```
var actor = new (require('understudy').Understudy)();
actor.before('load:plugins', function (config, next) {
  // load any plugins specified via config
  ...
  next();
});
actor.after('load:plugins', function (config, next) {
  console.log('plugins have been loaded');
  next(config);
});
actor.perform('load:plugins', config, function (config, allowAfter) {
  // start up app
  ...
  // opt-in for `after` interceptors
  allowAfter();
});
```

### before/after(action, interceptor) arguments

`action` - name of the action

`interceptor` - function to fire during action

### perform(action, ...args, done) arguments

`action` - name of the action

`...args` - any arguments to send

`done` - callback to fire once all deferences have finished

### action started

1. The actor will start performing an "action" with `...args` for arguments.
2. At the end of the arguments to the event will be added a `next` function.
3. Each before interceptors will be fired in order after the previous fires the `next` function.
4. After all interceptors have been fired the `done` function will fire with the arguments passed to the next function and an opt-in function to allow after interceptors.
5. If the `done` function opts in to after interceptors the after interceptors will be fired in order after the previous fires the `next` function.

## Examples

See the example directory