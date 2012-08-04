# Understudy

A means to provide interceptors when performing actions.

## Design Considerations

 * Modify input not output from functions, modification of output can lead to a function giving odd results that do not match documentation.
 * Only use pre-hooks.
 * Opt-in behavior.

## Usage

```
var actor = new (require('understudy').Understudy)()
actor.during('load:plugins', function (config, next) {
  // load any plugins specified via config
  ...
  next();
});
actor.perform('load:plugins', config, function () {
  // start up app
  ...
});
```

### during(action, interceptor) arguments

action - name of the action
interceptor - function to fire during action

### perform(action, ...args, done) arguments

action - name of the action
...args - any arguments to send
done - callback to fire once all deferences have finished

### action started

The actor will start performing an "action" with `...args` for arguments.
At the end of the arguments to the event will be added a `next` function.
Each interceptor will be fired in order after the previous fires the `next` function.
After all interceptors have been fired the `done` function will fire.

## Examples

See the example directory