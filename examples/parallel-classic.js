var fs = require('fs');
var gx = require('..');

gx(function*() {

	// skip yielding 
	fs.readFile("/etc/passwd", gx.resume);
	fs.readFile("/etc/group", gx.resume);
	
	// yield in order
	var passwd = yield null;
	var group = yield null;

	console.log(passwd);
	console.log(group);
});

