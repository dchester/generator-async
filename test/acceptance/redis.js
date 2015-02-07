var assert = require('assert');
var async = require('../..');
var redis = async.require('redis');

var host = process.env['REDIS_TEST_HOST'] || '172.17.42.1';
var port = process.env['REDIS_TEST_PORT'] || 6379;

suite('redis module', function() {

  test('redis hash keys get set okay', async(function*() {

    client = redis.createClient(port, host, {});
    client.on("error", console.warn);

    var reply = yield client.set("string key", "string val");
    assert.equal(reply, "OK");

    reply = yield client.hset("hash key", "hashtest 1", "some value");
    assert.equal(reply, 1);

    reply = yield client.hset(["hash key", "hashtest 2", "some other value"]);
    assert.equal(reply, 1);

    var keys = yield client.hkeys("hash key");
    assert.deepEqual(keys, ['hashtest 1', 'hashtest 2'])

    yield client.quit();

  }));
});

