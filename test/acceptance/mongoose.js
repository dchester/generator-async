var assert = require('assert');
var async = require('../..');
var mongoose = async.require('mongoose');

mongoose.connect('mongodb://172.17.42.1:27017/mongoose_test');

suite('mongoose module', function() {

  test('mongoose can read and write', async(function*() {

    var Post = mongoose.model('Post', {
      title: String,
      body: String,
      date: Date
    });

    var post = new Post({
      title: "jimmerz",
      body: "is the best",
      date: new Date
    });

    var result = yield post.save();
    assert.ok('_id' in result);

    var posts = yield Post.find();

    assert.ok(posts instanceof Array);
    assert.ok(posts.length);

    mongoose.connection.close()

  }));
});

process.on('SIGINT', function() {
  process.exit();
});


