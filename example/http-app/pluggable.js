//
// Simple plugin to load other plugins via config.get('plugins')
//
exports.name = 'pluggable';
exports.attach = function () {
   var app = this;
   var plugins = this.config.get('plugins');
   if (Array.isArray(plugins)) {
      plugins.forEach(function(pluginPath) {
         app.use(require(pluginPath));
      });
   }
   else if (typeof plugins === 'string') {
      app.use(require(plugins));
   }
   else if (typeof plugins === 'object') {
      Object.keys(plugins).forEach(function (pluginPath) {
         app.use(require(pluginPath), plugins[pluginPath]);
      });
   }
}