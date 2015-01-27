var assert = require('assert');
var async = require('../..');
var request = async.require('superagent');

suite('superagent module', function() {

  test('requests to google have a sane response', async(function*() {

    var response = yield request('http://www.google.com');
    assert.ok(String(response.text).match(/google/i));

    var response = yield request.get('http://www.google.com').end();
    assert.ok(String(response.text).match(/google/i));

  }));
});
