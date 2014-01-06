var gx = require('..');
var fs = require('fs');

var read = gx.gentrify(fs.readFile);

gx(function*() {
    var data = yield read("/etc/passwd");
    console.log(data);
});
