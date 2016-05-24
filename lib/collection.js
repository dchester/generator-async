"use strict";
var _async = require('async');

module.exports = function(async) {

  var source = {
    simple: [
      'filter',
      'filterSeries',
      'reject',
      'rejectSeries',
      'detect',
      'detectSeries',
      'some',
      'every'
    ],
    standard: [
      'forEach',
      'forEachSeries',
      'each',
      'eachSeries',
      'eachLimit',
      'map',
      'mapSeries',
      'mapLimit',
      'reduce',
      'reduceRight',
      'sortBy',
      'concat',
      'concatSeries'
    ]
  }

  var properties = {};

  source.standard.forEach(function(method) {
    properties[method] = async.proxy(function() {

      // poor man's spread to pull out function args, generator, and callback
      var args = [].slice.call(arguments, 0, arguments.length - 2);
      var generator = arguments[arguments.length - 2];
      var cb = arguments[arguments.length - 1];

      if (typeof cb != 'function') {
        throw new Error('missing callback function');
      }

      if (typeof generator != 'function') {
        throw new Error('last argument should be a generator function');
      }

      var _args = []
        .concat(args)
        .concat(async.fn(generator))
        .concat(cb);

      _async[method].apply(null, _args);

    });
  });

  source.simple.forEach(function(method) {
    properties[method] = async.proxy(function(arr, generator, cb) {
      var _iterator = async.fn(generator);
      var iterator = function(item, _cb) {
        _iterator(item, function(err, val) { _cb(val) });
      };
      _async[method](arr, iterator, function(val) {
        cb(null, val);
      });
    });
  });

  return properties;
};
