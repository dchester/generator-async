var gx = require('..');
var fs = require('fs');

gx(function*() {
    var data = yield fs.readFile("/etc/passwd", gx.resume);
    console.log(data);
});
