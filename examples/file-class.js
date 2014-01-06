var fs = require('fs');
var gx = require('..');

var File = function() {
	this.initialize.apply(this, arguments);
};

File.prototype = {

	initialize: function(filename) {
		this.filename = filename;
	},
	read: function*() {
		var contents = yield fs.readFile(this.filename, gx.resume);
		return contents;
	},
	size: function*() {
		var stat = yield fs.stat(this.filename, gx.resume);
		return stat.size;
	}
};

gx.gentrify(File);

gx(function*() {
	var file = new File('/etc/passwd');
	var size = yield file.size();
});

var file = new File('/etc/passwd');
file.size(function(err, size) {
	console.log(size);
});

