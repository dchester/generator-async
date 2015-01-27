var assert = require('assert');
var async = require('../..');
var fs = async.require('fs');

suite('node fs module', function() {

  test('fs.readFile', async(function*() {

    var passwd = yield fs.readFile('/etc/passwd', 'utf-8');
    assert.ok(passwd.match(/root/));

    var group = yield fs.readFile('/etc/group', 'utf-8');
    assert.ok(group.match(/root/));

  }));

  test('fs.exists', async(function*() {

    var exists = yield fs.exists('/etc/passwd');
    assert.equal(exists, true);

    var bogus = yield fs.exists('/nonsense-sf98u23');
    assert.equal(bogus, false);

  }));

});
