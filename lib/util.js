module.exports = {

  keys: function(obj) {

    var blacklist = ['callee', 'caller', 'arguments'];

    var keys = Object.getOwnPropertyNames(obj);

    for (var k in obj) {
      if (keys.indexOf(k) == -1) {
        keys.push(k);
      }
    }

    keys = keys.filter(function(k) { return blacklist.indexOf(k) == -1 });

    return keys;
  },

  is_function: function(fn) {

    if (typeof fn != "function") return;
    if (fn.constructor.name != "Function") return;

    return true;
  },

  is_generator: function(fn) {

    if (typeof fn != "function") return;
    if (fn.constructor.name != "GeneratorFunction") return;

    return true;
  },

  clone_properties: function(src, dst) {

    Object.getOwnPropertyNames(src).forEach(function(name) {
      var prop = Object.getOwnPropertyDescriptor(src, name);
      if (prop.configurable) {
        Object.defineProperty(dst, name, prop);
      }
    });
  },

  extend: function(obj, source) {

    var props = this.keys(obj);

    props.forEach(function(prop) {
      if (obj[prop] != source[prop]) {
        obj[prop] = source[prop];
      }
    });
  },

  is_generator_caller: function() {

    var generatorCaller;
    var fn = this.is_generator_caller;

    var gnode = require.extensions['.js'].name == 'gnodeJsExtensionCompiler';

    // hack to discover whether we're in a gnode/regenerator-style generator
    if (
      gnode &&
      fn.caller &&
      fn.caller.caller &&
      fn.caller.caller.caller &&
      fn.caller.caller.caller.toString().match(/^function invoke[\s\S]*GenStateExecuting/m)
    ) {
      generatorCaller = true;
    }

    if (fn.caller && fn.caller.caller && fn.caller.caller.constructor.name == 'GeneratorFunction') {
      generatorCaller = true;
    }

    return generatorCaller;
  }
};
