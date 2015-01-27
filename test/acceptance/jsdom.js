var assert = require('assert');
var async = require('../..');
var jsdom = async.require('jsdom');

suite('jsdom module', function() {

  test('we get a sane DOM from markup', async(function*() {

    var window = yield jsdom.env('<a href="/">Home</a>');
    var anchors = window.document.getElementsByTagName('a');
    assert.equal(anchors.length, 1);

  }));
});

