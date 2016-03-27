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
    properties[method] = async.proxy(function(arr, generator, cb) {
      _async[method](arr, async.fn(generator), cb);
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
