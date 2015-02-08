var packagePath = require('package-path');
var callsite = require('callsite');

module.exports = function(async) {

  var cache = {};
  var schemes = require('../schemes');

  return {

    require: function(file, hints) {

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
        /* jshint unused:false */
        var version = pkg.version;
      } catch (e) {}

      version = version || '*';

      // momentarily delete from require cache proper
      var _obj = require.cache[key];
      delete require.cache[key];

      var obj = require(file);

      // restore the cache proper
      require.cache[key] = _obj;

      var _hints = schemes.scheme(file, version) || {};
      for (var k in hints) _hints[k] = hints[k];
      obj = async.wrap(obj, { hints: _hints });
      cache[key] = obj;

      if (_hints && _hints['~setup']) {
        obj = _hints['~setup'](obj) || obj;
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
