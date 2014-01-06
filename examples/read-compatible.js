var gx = require('..');
var fs = require('fs');

// gentrify to make async generator compatible
fs = gx.gentrify(fs);

// since fs is gentrified we don't need to resume
gx(function*() {
	var data = yield fs.readFile("/etc/passwd");
	console.log(data);
});

// original interface is still intact
fs.readFile("/etc/passwd", function(err, data) {
	console.log(data);
});

