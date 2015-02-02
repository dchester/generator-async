var packagePath = require('package-path');
var callsite = require('callsite');

module.exports = function(async) {

  var cache = {};
  var schemes = require('../schemes');

  return {

    require: function(file) {

      var path = require('path');

      // handle relative paths
      if (file.match(/^(\.\/|\/|\.\.($|\/))/)) {
        var caller = callsite()[2].getFilename();
        var base = path.dirname(caller);
        file = path.resolve(base, file);
      }

      var key = require.resolve(file);
      if (cache[key]) return cache[key];

      try {
        var pkg = require(path.join(packagePath.sync(key), 'package.json'));
        var version = pkg.version;
      } catch (e) {}

      version = version || '*';

      // momentarily delete from require cache proper
      var _obj = require.cache[key];
      delete require.cache[key];

      var obj = require(file);

      // restore the cache proper
      require.cache[key] = _obj;

      var scheme = schemes.scheme(file, version);
      obj = async.wrap(obj, { scheme: scheme });
      cache[key] = obj;

      if (scheme && scheme['~setup']) {
        obj = scheme['~setup'](obj) || obj;
      }

      return obj;
    },

    cache: cache,

    moduleSchemes: schemes,

    callbackTransforms: {
      simple: function(args) { return [ null, args[0] ] },
      standard: function(args) { return args },
      generator: function(args) { return args },
      raw: function(args) { return [ null, args ] }
    }
  };
};
