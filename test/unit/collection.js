"use strict";
var assert = require('assert');
var async = require('../..');

var numbers = [1, 2, 3, 4, 5];

suite('collection', function() {

  test('forEach', function(done) {

    async.run(function*() {
      var items = [];
      yield async.forEach(numbers, function*(x) { items.push(x) });
      assert.deepEqual(items, [1, 2, 3, 4, 5]);
      done();
    });
  });

  test('eachLimit', function(done) {

    async.run(function*() {
      var items = [];
      yield async.eachLimit(numbers, 2, function*(x) { items.push(x) });
      assert.deepEqual(items, [1, 2, 3, 4, 5]);
      done();
    });
  });

  test('map', function(done) {

    async.run(function*() {
      var doubles = yield async.map(numbers, function*(x) { return x * 2 });
      assert.deepEqual(doubles, [2, 4, 6, 8, 10]);
      done();
    });
  });

});
