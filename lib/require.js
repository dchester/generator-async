"use strict";
var packagePath = require('package-path');
var callsite = require('callsite');
var mapper = require('module-async-mapper');

module.exports = function(async) {

  var cache = {};
  var adapters = require('../adapters');

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

      var nonLocal = path.dirname(key) == '.';

      try {
        // don't traverse up we only have a filename
        if (!nonLocal) {
          var _path = packagePath.sync(key);
          var pkg = require(path.join(packagePath.sync(key), 'package.json'));
          /* jshint unused:false */
          var version = pkg.version;
        }
      } catch (e) {}

      version = version || '*';

      // momentarily delete from require cache proper
      var _obj = require.cache[key];
      delete require.cache[key];

      var obj = require(file);

      // restore the cache proper
      require.cache[key] = _obj;

      var _hints = nonLocal ? {} : mapper.loadHints(file, version) || {};
      for (var k in hints) _hints[k] = hints[k];
      obj = async.wrap(obj, { hints: _hints });
      cache[key] = obj;

      var adapter = adapters.resolve(file, version);
      if (adapter) obj = adapter(obj) || obj;

      return obj;
    },

    cache: cache,

    callbackTransforms: {
      simple: function(args) { return [ null, args[0] ] },
      standard: function(args) { return args },
      generator: function(args) { return args },
      raw: function(args) { return [ null, args ] }
    }
  };
};
