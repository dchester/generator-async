var gx = require('..');
var fs = require('fs');

var read = gx.gentrify(fs.readFile);

gx(function*() {

	// kick off read operations with gx.defer
	gx.defer(read("/etc/passwd"));
	gx.defer(read("/etc/group"));
	
	// yield in order
	var passwd = yield null;
	var group = yield null;

	console.log(passwd);
	console.log(group);
});

