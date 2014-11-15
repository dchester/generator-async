var fs = require('fs');
var gx = require('..');
var Promise = require('es6-promise').Promise;

exports.fn = function(test) {

	var generator = function*(a, b) {
		return a + b;
	};

	var add = gx.fn(generator);

	add(7, 11, function(err, value) {
		test.equal(value, 18);
		test.done();
	});
};

exports.fnYield = function(test) {

	var thunk = new Thunk;

	var generator = function*(a, b) {
		yield thunk(gx.resume);
		return a + b;
	};

	var add = gx.fn(generator);

	add(7, 11, function(err, value) {
		test.equal(value, 18);
		test.done();
	});
};

exports.proxyClassic = function(test) {

	var thunk = new Thunk;
	var proxy = gx.proxy(thunk);

	test.ok(proxy instanceof Function);

	proxy(function(err, data) {
		test.equal(data, "OK");
		test.done();
	});
};

exports.proxyGenerator = function(test) {

	var thunk = new Thunk;
	var proxy = gx.proxy(thunk);

	test.ok(proxy instanceof Function);

	gx(function*() {
		var data = yield proxy();
		test.equal(data, "OK");
		test.done();
	});
};

exports.proxyGeneratorMulti = function(test) {

	var identity = new Identity;
	var proxy = gx.proxy(identity);

	test.ok(proxy instanceof Function);

	gx(function*() {

		var data1 = yield proxy("OK 1");
		test.equal(data1, "OK 1");

		var data2 = yield proxy("OK 2");
		test.equal(data2, "OK 2");

		test.done();
	});
};

exports.promise = function(test) {

	var accountant = new AccountantGuarantor;

	gx(function*() {
		var sum = yield accountant.add(7, 5);
		test.equal(sum, 12);
		test.done();
	});
};

exports.promiseReject = function(test) {

	var accountant = new AccountantGuarantor;

	gx(function*() {
		try {
			var sum = yield accountant.add(null);
		} catch(e) {
			test.ok(!!e.message.match(/bad params/));
			test.done();
		}
	});
};

exports.parallel = function(test) {

	var identity = gx.gentrify(new Identity);
	var delay = gx.gentrify(new Delay);

	gx(function*() {

		delay(3, gx.resume);
		identity(7, gx.resume);

		var three = yield null;
		var seven = yield null;

		test.equal(three, 3);
		test.equal(seven, 7);
		test.done();
	});
};

exports.defer = function(test) {

	var identity = gx.gentrify(new Identity);

	gx(function*() {

		gx.defer(identity(27));
		var twentySeven = yield null;

		test.equal(twentySeven, 27);
		test.done();
	});
};

exports.deferMulti = function(test) {

	var identity = gx.gentrify(new Identity);

	gx(function*() {

		gx.defer(identity(28));
		gx.defer(identity(29));

		var twentyEight = yield null;
		var twentyNine = yield null;

		test.equal(twentyEight, 28);
		test.equal(twentyNine, 29);

		test.done();
	});
};

exports.generatorMethod = function(test) {

	var Rectangle = new RectangleClass;
	var areaMethod = gx.proxy(gx.fn(Rectangle.prototype.area));

	gx(function*() {
		var rect = new Rectangle(11, 3);
		var area = yield areaMethod.apply(rect);
		test.equal(area, 33);
		test.done();
	});
};

exports.generatorClass = function(test) {

	var Rectangle = new RectangleClass;
	gx.gentrify(Rectangle);

	gx(function*() {
		var rect = new Rectangle(11, 3);
		var area = yield rect.area();
		test.equal(area, 33);
		test.done();
	});
};

exports.error = function(test) {

	var err = new Err;
	var gentry = gx(err);

	gx(function*() {
		try {
			var data = yield gentry();
		} catch(e) {
			test.ok(!!e.message.match(/oh noes/));
			test.done();
		}
	});
};

exports.keys = function(test) {

	var maths = gx.gentrify(new Maths);

	gx(function*() {
		var sum = yield maths.add(5, 7);
		test.equal(sum, 12);
		test.done();
	});
};

exports.parallel = function(test) {

	var identity = gx.gentrify(new Identity);
	var delay = gx.gentrify(new Delay);

	gx(function*() {

		delay(3, gx.resume);
		identity(7, gx.resume);

		var three = yield null;
		var seven = yield null;

		test.equal(three, 3);
		test.equal(seven, 7);
		test.done();
	});
};

exports.asyncConstructorClassic = function(test) {

	var Rect = function() {
		this.initialize.apply(this, arguments);
	};

	Rect.prototype.initialize = function(w, h, cb) {
		this.w = w;
		this.h = h;
		cb(null, this);
	};

	gx(function*() {
		var rect = new Rect(2, 7, function(err, rect) {
			test.equal(rect.w, 2);
			test.equal(rect.h, 7);
			test.done();
		});
	});
};

exports.asyncConstructor = function(test) {

	var Rect = function(w, h, cb) {
		this.w = w;
		this.h = h;
		cb(null, this);
	};

	Rect = gx.gentrify(Rect);

	gx(function*() {
		var rect = yield new Rect(2, 7);
		test.equal(rect.w, 2);
		test.equal(rect.h, 7);
		test.done();
		
	});
};

exports.asyncInitialize = function(test) {

	var Rect = function(w, h, cb) {
		this.initialize(w, h , cb);
	};

	Rect.prototype.initialize = function*(w, h) {
		this.w = w;
		this.h = h;
		return this;
	};

	Rect.prototype.area = function*() {
		return this.w * this.h;
	};

	Rect = gx.gentrify(Rect);

	gx(function*() {
		var rect = yield new Rect(2, 7);
		test.equal(rect.w, 2);
		test.equal(rect.h, 7);
		test.done();
	});
};

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

function Thunk() {
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

