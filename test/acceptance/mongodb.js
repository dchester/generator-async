var assert = require('assert');
var async = require('../..');
var mongodb = async.require('mongodb');
var client = mongodb.MongoClient;

suite('mongodb module', function() {

  test('insert and read docs from mongo', async(function*() {

    var db = yield client.connect('mongodb://172.17.42.1:27017/test');
    assert.ok(db);

    var collection = db.collection('documents');

    var result = yield collection.insert([ {a : 1}, {a : 2}, {a : 3} ]);
    assert.equal(result.length, 3);

    yield collection.ensureIndex({ a: 1 });

    var results = yield collection.find().toArray();
    assert.ok(results instanceof Array);
    assert.ok(results.length);

    db.close();

  }));
});

process.on('SIGINT', function() {
  process.exit();
});

