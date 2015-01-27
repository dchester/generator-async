var _methods = require('methods');

module.exports = function(express) {

	var async = require('..');
	var methods = [].concat(_methods, 'all');

	methods.forEach(function(method) {

		var _orig = express.Route.prototype[method];

		express.Route.prototype[method] = function() {

			var callbacks = flatten([].slice.call(arguments));

			callbacks.forEach(function(fn, index) {	
				if (fn.constructor.name == 'GeneratorFunction') {
					callbacks[index] = async.fn(fn);
				}
			});

			_orig.apply(this, callbacks);
		};
	});
};

function flatten(arr, ret) {
	ret = ret || [];
	var len = arr.length;
	for (var i = 0; i < len; ++i) {
		if (Array.isArray(arr[i])) {
			flatten(arr[i], ret);
		} else {
			ret.push(arr[i]);
		}
	}
	return ret;
};


