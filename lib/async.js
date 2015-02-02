var Context = require('./context');
var util = require('./util');
var mapper = require('module-async-map');
var jp = require('jsonpath');

var async = function(input, args) {

  args = Object(args);

  var method =
    util.is_generator(input) ? 'proxy' :
    input instanceof Function && Object.keys(input.prototype).length ? 'traverse' :
    input instanceof Function && Object.keys(input).length ? 'traverse' :
    input instanceof Function ? 'proxy' :
    input instanceof Object ? 'traverse' : null;

  if (!method) return input;

  var obj = async[method].apply(this, arguments);

  return obj;
};

async.wrap = async;

async.traverse = function(obj, args) {

  args = Object(args);

  var map = args.scheme ? mapper.map(obj, args.scheme) : mapper.explore(obj);

  var transformKey = map.$;
  var transform = async.callbackTransforms[transformKey];
  var root = transform ? async.proxy(obj, transform) : obj;

  Object.keys(map).forEach(function(path) {
    if (path == '$') return;
    var transformKey = map[path];
    var transform = async.callbackTransforms[transformKey];
    if (transform) {
      jp.apply(obj, path, function(fn) {
                                // TODO: if path continas leading or trailing underscore, skip
        return async.proxy(fn, transform)
      });
    }
  });

  util.extend(root, obj);
  return root;
};

async.proxy = function(fn, transform) {

  if (fn._async_proxy) return fn;

  if (util.is_generator(fn)) fn = async.fn(fn);

  var mediator = function(done) {

    var args = arguments;

    var generatorCaller = util.is_generator_caller(mediator);

    if (!generatorCaller) {
      return fn.apply(this, arguments);
    }

    var proxy = function(callback) {
      callback._proxy_caller = true;
      args[args.length++] = callback;
      fn.apply(this, args);

    }.bind(this);

    if (transform) {
      proxy.async = { transform: transform };
    }

    return proxy;
  };

  mediator._async_proxy = true;
  util.clone_properties(fn, mediator);

  return mediator;
};

async.parallel = function(val) {

  if (!val) return;

  if (val.then && util.is_function(val.then)) {
    return val.then(async.simple);
  }

  if (util.is_function(val)) {
    return val(async.cb);
  }
};

async.fire = function(val) {
  if (!val) return;

  if (val.then && util.is_function(val.then)) {
    return val.then(function() {});
  }

  if (util.is_function(val)) {
    return val(function() {});
  }
};

async.yield = '_async_yield';

async.fn = function(generator) {

  if (!generator) throw new Error("async.fn needs a generator");
  if (util.is_function(generator)) return generator;

  return function(_arguments) {

    // questionably take _arguments since some libs like mocha inspect

    var args = [];

    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var callback = arguments[arguments.length - 1];
    if (!util.is_function(callback)) callback = function() {};

    var context = new Context(generator, args, this);
    context.run(callback);
  };
};

async.run = function(generator, callback) {

  callback = callback || function() {};

  var context = new Context(generator);
  context.run(callback);
};

async.extend = function(methods) {
  var _methods = methods(async);
  Object.keys(_methods).forEach(function(method) {
    async[method] = _methods[method];
  });
}

async._id = '__async';

async.extend(require('./collection'));
async.extend(require('./require'));

Object.defineProperty(async, 'cb', {
  get: function() {
    var context = Context.stack.active();
    return context.cb();
  }
});

Object.defineProperty(async, 'simple', {
  get: function() {
    var context = Context.stack.active();
    return context.cb(async.callbackTransforms.simple);
  }
});

Object.defineProperty(async, 'raw', {
  get: function() {
    var context = Context.stack.active();
    return context.cb(async.callbackTransforms.raw);
  }
});

module.exports = async;
