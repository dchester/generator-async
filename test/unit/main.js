var assert = require('assert');
var fs = require('fs');
var async = require('../..');
var Promise = require('es6-promise').Promise;

suite('main', function() {

  test('fn', function(done) {

    var generator = function*(a, b) {
      return a + b;
    };

    var add = async.fn(generator);

    add(7, 11, function(err, value) {
      assert.equal(value, 18);
      done();
    });

  });

  test('fnYield', function(done) {

    var callback = new NodeCallback;

    var generator = function*(a, b) {
      callback(async.cb);
      yield async;
      return a + b;
    };

    var add = async.fn(generator);

    add(7, 11, function(err, value) {
      assert.equal(value, 18);
      done();
    });

  });

  test('proxyClassic', function(done) {

    var callback = new NodeCallback;
    var proxy = async.proxy(callback);

    assert.ok(proxy instanceof Function);

    proxy(function(err, data) {
      assert.equal(data, "OK");
      done();
    });

  });

  test('proxyGenerator', function(done) {

    var callback = new NodeCallback;
    var proxy = async.proxy(callback);

    assert.ok(proxy instanceof Function);

    async.run(function*() {
      var data = yield proxy();
      assert.equal(data, "OK");
      done();
    });

  });

  test('proxyGeneratorMulti', function(done) {

    var identity = new Identity;
    var proxy = async.proxy(identity);

    assert.ok(proxy instanceof Function);

    async.run(function*() {

      var data1 = yield proxy("OK 1");
      assert.equal(data1, "OK 1");

      var data2 = yield proxy("OK 2");
      assert.equal(data2, "OK 2");

      done();
    });

  });

  test('promise', function(done) {

  var accountant = new AccountantGuarantor;

    async.run(function*() {
      var sum = yield accountant.add(7, 5);
      assert.equal(sum, 12);
      done();
    });

  });

  test('promiseParallel', function(done) {

    var accountant = new AccountantGuarantor;

    async.run(function*() {

      async.parallel( accountant.add(7, 2) );
      async.parallel( accountant.add(3, 5) );

      var nine = yield async;
      var eight = yield async;

      assert.equal(nine, 9);
      assert.equal(eight, 8);

      done();
    });

  });

  test('promiseReject', function(done) {

    var accountant = new AccountantGuarantor;

    async.run(function*() {
      try {
        var sum = yield accountant.add(null);
      } catch(e) {
        assert.ok(!!e.message.match(/bad params/));
        done();
      }
    });

  });

  test('parallel', function(done) {

    var identity = async.wrap(new Identity);
    var delay = async.wrap(new Delay);

    async.run(function*() {

      async.parallel(delay(3));
      async.parallel(identity(7));

      var three = yield async;
      var seven = yield async;

      assert.equal(three, 3);
      assert.equal(seven, 7);
      done();
    });

  });

  test('parallelCallback', function(done) {

    var identity = new Identity;
    var delay = new Delay;

    async.run(function*() {

      async.parallel(delay(3, async.cb));
      async.parallel(identity(7, async.cb));

      var three = yield async;
      var seven = yield async;

      assert.equal(three, 3);
      assert.equal(seven, 7);
      done();
    });

  });

  test('parallelMixed', function(done) {

    var identity = new Identity;
    var delay = async.wrap(new Delay);

    async.run(function*() {

      async.parallel(delay(3));
      async.parallel(identity(7, async.cb));

      var three = yield async;
      var seven = yield async;

      assert.equal(three, 3);
      assert.equal(seven, 7);
      done();
    });

  });

  test('defer', function(done) {

    var identity = async.wrap(new Identity);

    async.run(function*() {

      async.parallel(identity(27));
      var twentySeven = yield async;

      assert.equal(twentySeven, 27);
      done();
    });

  });

  test('deferMulti', function(done) {

    var identity = async.wrap(new Identity);

    async.run(function*() {

      async.parallel(identity(28));
      async.parallel(identity(29));

      var twentyEight = yield async;
      var twentyNine = yield async;

      assert.equal(twentyEight, 28);
      assert.equal(twentyNine, 29);

      done();
    });

  });

  test('generatorMethod', function(done) {

    var Rectangle = new RectangleClass;
    var areaMethod = async.proxy(async.fn(Rectangle.prototype.area));

    async.run(function*() {
      var rect = new Rectangle(11, 3);
      var area = yield areaMethod.apply(rect);
      assert.equal(area, 33);
      done();
    });

  });

  test('generatorClass', function(done) {

    var Rectangle = new RectangleClass;
    Rectangle = async.wrap(Rectangle);

    async.run(function*() {
      var rect = new Rectangle(11, 3);
      var area = yield rect.area();
      assert.equal(area, 33);
      done();
    });

  });

  test('error', function(done) {

    var err = new Err;
    var gentry = async.wrap(err);

    async.run(function*() {
      try {
        var data = yield gentry();
      } catch(e) {
        assert.ok(!!e.message.match(/oh noes/));
        done();
      }
    });

  });

  test('keys', function(done) {

    var maths = async.wrap(new Maths);

    async.run(function*() {
      var sum = yield maths.add(5, 7);
      assert.equal(sum, 12);
      done();
    });

  });

  test('asyncConstructorClassic', function(done) {

    var Rect = function() {
      this.initialize.apply(this, arguments);
    };

    Rect.prototype.initialize = function(w, h, cb) {
      this.w = w;
      this.h = h;
      cb(null, this);
    };

    async.run(function*() {
      var rect = new Rect(2, 7, function(err, rect) {
        assert.equal(rect.w, 2);
        assert.equal(rect.h, 7);
        done();
      });
    });

  });

  test('asyncConstructor', function(done) {

    var Rect = function(w, h, cb) {
      this.w = w;
      this.h = h;
      cb(null, this);
    };

    Rect = async.wrap(Rect);

    async.run(function*() {
      var rect = yield new Rect(2, 7);
      assert.equal(rect.w, 2);
      assert.equal(rect.h, 7);
      done();
    });

  });

  test('asyncInitialize', function(done) {

    var Rect = function(w, h, cb) {
      this.initialize(w, h, cb);
    };

    Rect.prototype.initialize = function*(w, h) {
      this.w = w;
      this.h = h;
      return this;
    };

    Rect.prototype.area = function*() {
      return this.w * this.h;
    };

    Rect = async.wrap(Rect);

    async.run(function*() {
      var rect = yield new Rect(2, 7);
      assert.equal(rect.w, 2);
      assert.equal(rect.h, 7);
      done();
    });

  });

  test('fire', function(done) {

    var x = 0;

    var dl = async.proxy(function(value, callback) {
      setTimeout(function() {
        callback(null, value);
      }, 250);
    });

    var incrementer = async(function*() {
      x += 1;
    });

    async.run(function*() {
      async.fire(incrementer());
    });

    setTimeout(function() {
      assert.equal(x, 1);
      done();
    }, 100);

  });

});

function Identity() {
  return function(value, callback) {
    setImmediate(function() {
      callback(null, value);
    });
  };
};

function Delay() {
  return function(value, callback) {
    setTimeout(function() {
      callback(null, value);
    }, 250);
  }
};

function Err() {
  return function(callback) {
    setImmediate(function() {
      callback("oh noes!");
    });
  };
};

function NodeCallback() {
  return function(callback) {
    setImmediate(function() {
      callback(null, "OK");
    });
  }
};

function Maths() {
  return {
    add: function(a, b, callback) {
      callback(null, a + b);
    },
    multiply: function(a, b, callback) {
      callback
    }
  };  
};

function AccountantGuarantor() {
  return {
    add: function(a, b) {
      return new Promise(function(resolve, reject) {
        if (Number(a) !== a) reject("bad params");
        setImmediate(function() { resolve(a + b) });
      })
    }
  };
};

function RectangleClass() {

  var Rectangle = function() {
    this.initialize.apply(this, arguments);
  };

  Rectangle.prototype = {

    initialize: function(width, height) {
      this.width = width;
      this.height = height;
    },
    area: function*() {
      return this.width * this.height;
    }
  };

  return Rectangle;
};

