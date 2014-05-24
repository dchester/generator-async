# Gx

Flexible generator-based asynchronous control flow for Node.js.  Requires Node >= v0.11.3 with the `--harmony-generators` flag.

## Introduction

Gx offers a minimally-invasive approach:

```js
var gx = require('gx');

gx(function*() {
	var data = yield fs.readFile("/etc/passwd", gx.resume);
	console.log(data);
});
```
Or, "gentrify" functions for a cleaner interface with no need to resume:

```js
var fs = require('fs');
var read = gx.gentrify(fs.readFile);

gx(function*() {
	var data = yield read("/etc/passwd");
	console.log(data);
});
```

Still yet, gentrify entire modules, and classes too.  See more below.


## Gentrifying Modules

If you're feeling brave, gentrify entire modules:

```js
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
```

## Gentrifying Classes

Gentrified classes that define methods as generator functions will automatically have those generator functions wrapped in a gentrified context, meaning they'll be invoked and executed when called by consumers.

Consider a Class representing a file:

```js
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
```

Consume this functionality in a gentrified context:

```js
gx(function*() {
	var file = new File('/etc/passwd');
	var size = yield file.size();
	console.log(size);
});
```

Or, consume this functionality as-is just like normal with conventional callbacks.

```js
var file = new File('/etc/passwd');
file.size(function(err, size) {
	console.log(size);
};
```

## Running in Parallel

Defer gentrified functions with `gx.defer` and then yield in the same order.

```js
gx(function*() {

	// kick off read operations with gx.defer
	gx.defer(read("/etc/passwd"));
	gx.defer(read("/etc/group"));
	
	// yield in order
	var passwd = yield gx.join;
	var group = yield gx.join;
});
```

Or with classic callback-based functions, refer to gx.resume like normal but hold off yielding until you're ready.

```js
gx(function*() {

	// skip yielding 
	fs.readFile("/etc/passwd", gx.resume);
	fs.readFile("/etc/group", gx.resume);
	
	// yield in order
	var passwd = yield gx.join;
	var group = yield gx.join;
});
```


## Gentrify API

#### gx(generator)

Invokes and executes the supplied generator.

#### gx.gentrify(input)

Implementation depends on the type of input.  Given a function, generator, object, or class, proxies to the appropriate method below.

#### gx.proxy(function)

Returns a wrapped version of the supplied function compatible to be run either in a generator async context or classic node callback style.

#### gx.fn(generator)

Returns a function that when called will invoke and execute the supplied generator function.

#### gx.run(generator)

Invokes and executes the supplied generator function.

#### gx.keys(object)

Iterates through object keys and wraps functions to be compatible in a generator async context.

#### gx.class(klass)

Wraps instance methods (on the prototype) and class methods (on the constructor function) to be compatible in a generator async context.


## Motivation and Comparison

Gentrify takes lots of inspiration from other generator-based control flow libraries such as [co](https://github.com/visionmedia/co), [genny](https://github.com/spion/genny), [galaxy](https://github.com/bjouhier/galaxy), and [suspend](https://github.com/jmar777/suspend).

##### Wrapping should be possible but not required

Ideally if we want to call some asynchronous function that doesn't follow the classic `function(err, data)` callback convention, like `setTimeout` (takes the callback as the first parameter) or `fs.exists` (no `err` parameter), we should have a no-effort way to just go ahead and do that.  With **gx**, reference `gx.resume` wherever the callback would naturally lie.

There's no doubt that **co** is awesome, but the requirement that functions be wrapped puts a burden on the consumer, and imposes [compatibility layers](https://github.com/visionmedia/co/wiki) for every library used within the `co` context.

##### Wrapped libraries should preserve their original interface

Ideally we should be able to write libraries that work both in the classic callback style, and in an async generator style, without having to wrap or unwrap, or maintain separate compatibility npm modules.  The **galaxy** library implements `star()` and `unstar()` to be able to go back and forth, but nicer would be to have the given library just work in either context.  With **gx** even after you "gentrify" modules retain their original interface.

##### Stack traces should be informative and meaningful

When things go wrong ideally we have a logical stack trace to make sense of.  As of yet, other libraries do better at this, but **gx** does passably okay.

## License

Copyright (c) 2014 David Chester

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
