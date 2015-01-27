var assert = require('assert');
var async = require('../..');
var glob = async.require('glob');

suite('glob module', function() {

  test('sync and async glob files match', async(function*() {
  var syncFiles = glob.sync("*");
  var asyncFiles = yield glob("*");
  assert.deepEqual(asyncFiles, syncFiles);
  }));

});

