var assert = require('assert');
var path = require('path');
var async = require('../..');
var fs = async.require('fs');
var mkdirp = async.require('mkdirp');
var rimraf = async.require('rimraf');

suite('mkdirp and rimraf modules', function() {

  test('create and remove nested temp dirs', async(function*() {

    var root = 'mkdirp-' + parseInt(Math.random() * 10000);
    var nested = path.join(root, 'nested', 'dir');

    assert.equal(yield fs.exists(root), false);

    yield mkdirp(nested);
    assert.equal(yield fs.exists(nested), true);

    yield rimraf(root);
    assert.equal(yield fs.exists(root), false);

  }));
});
