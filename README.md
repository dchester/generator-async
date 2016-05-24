[![Build Status](https://travis-ci.org/dchester/generator-async.png?branch=master)](https://travis-ci.org/dchester/generator-async)

# generator-async

Flexible generator-based asynchronous control flow for Node.js.  

## Introduction

With `generator-async` use both callback-based and promise-based libraries all together with a clean, consistent interface.  Use the `yield` keyword before an asynchronous function call that would normally take a callback or return a promise, and skip the callback or call to `then()`.

```js
var async = require('generator-async');

// load `fs` with async's `require`
var fs = async.require('fs');

async.run(function*() {

	// read a file
	var passwd = yield fs.readFile('/etc/passwd');

	// then read another file
	var group = yield fs.readFile('/etc/group');

	// then spit out the contents of both files
	console.log(passwd, group);
});
```

In this example, the contents of `/etc/passwd` are read from disk and assigned to `passwd`.  Program execution waits on the I/O and assignment, while the process event loop keeps on moving.  That's in contrast to `fs.readFileSync` for example, where the entire process waits.

Notice `fs` was loaded through `async.require`, which wraps async methods to be compatible.  If you'd rather not wrap, you can load modules directly like normal, and just refer to `async.cb` wherever a standard callback would be expected.  See the [Alternative Explicit Callback Interface](#alternative-explicit-callback-interface) section below for more.


## Running in Parallel

Run functions concurrently with `async.parallel` and then yield in the same order.

```js
async.run(function*() {

	// kick off read operations with async.parallel
	async.parallel( fs.readFile('/etc/passwd') );
	async.parallel( fs.readFile('/etc/group') );
	
	// yield in order
	var passwd = yield async.yield;
	var group = yield async.yield;
});
```

## Examples

### Working with Request

```js
var request = async.require('request');

async.run(function*() {

	var data = yield request('http://www.google.com');
	console.log(data);
});
```

### Working with Redis

```js
var redis = async.require('redis');

async.run(function*() {

	var client = redis.createClient(6379, '172.17.42.1', {});

	yield client.hset("hash key", "hashtest 1", "some value");
	yield client.hset("hash key", "hashtest 2", "some other value");

	var data = yield client.hkeys("hash key");
	console.log(data);
});
```

### Working with Express

Use generator functions directly as route handlers.

```js
var express = async.require('express');
var fs = async.require('fs');

var app = express();

app.get('/', function*(req, res) {

	var data = yield fs.readFile('/etc/passwd');
	res.end(data);
});
```

### Working with the file system

```js
var fs = async.require('fs');
var mkdirp = async.require('mkdirp');
var rimraf = async.require('rimraf');
var path = require('path');
var assert = require('assert');

async.run(function*() {

	// come up with a random-ish nested dir name and see that it doesn't exist yet
	var name = path.join('mkdirp-' + parseInt(Math.random() * 10000), 'nested', 'dir');
	assert.equal(yield fs.exists(name), false);

	// create the new directory and see that it exists
	var err = yield mkdirp(name);
	assert.equal(yield fs.exists(name), true);

	// remove our nascent dir and see that it no longer exists
	yield rimraf(name);
	assert.equal(yield fs.exists(name), false);
});
```

## Wrapping Classes

Wrapped classes that define methods as generator functions will automatically have those generator functions wrapped in a generator-async context, meaning they'll be invoked and executed when called by consumers.

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
		var contents = yield fs.readFile(this.filename);
		return contents;
	},
	size: function*() {
		var stat = yield fs.stat(this.filename);
		return stat.size;
	}
};

File = async(File);
```

Consume this functionality in an `async.run` context:

```js
async.run(function*() {
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

## Alternative Explicit Callback Interface

Sometimes it's not feasible to wrap a module or method to be yieldable since it may have a non-standard callback scheme.  Or you may prefer the more verbose interface in order to use the module directly and shed some of the intermediary magic.  In that case, node's `require` like normal, and refer to `async.cb` where a callback is expected:

```js
// require `fs` directly
var fs = require('fs');

async.run(function*() {
	// refer to async.cb where the callback would go
	var contents = yield fs.readFile('/etc/passwd', async.cb);
	console.log(contents);
});
```

Use `async.cb` where a standard node callback would be expected (a function that accepts `err` and `data` parameters).  For non-standard callbacks refer to `async.raw` to get back all the values (and handle errors yourself).


## API

#### async(input)

Implementation depends on the type of input.  Given a function, or generator, returns a function that is both yieldable in an `async.run` context, and also compatible with a standard callback interface.  Given an object or class, returns the input with each of its methods wrapped to be yieldable.  Aliased as `async.wrap`.

#### async.require(module, [hints])

Imports a module Like node's native `require`, but also wraps that module so that its methods are yieldable in an `async.run` context with no callbacks necessary.

That's the goal at least. Wrapping involves making a heuristic best guess about which methods are asynchronous and what is their callback signature etc.  So while it often works well, you may sometimes need to give hints about the makeup of the module.  See [module-async-map](https://github.com/dchester/module-async-map) for more.

If you'd rather, feel free to use node's native `require` instead, and refer to `async.cb` where a callback is expected.

#### async.run(fn\*)

Invokes and executes the supplied generator function.

#### async.proxy(fn)

Returns a wrapped version of the supplied function compatible to be run either in an `async.run` context or standard node callback style.

#### async.fn(fn\*)

Returns a function that when called will invoke and execute the supplied generator function.


### Collection Methods

Since the `yield` keyword is only valid directly inside of generator functions, we can't `yield` inside of stock `Array` methods, which might be exactly what you want to do sometimes.  Instead, use these collection methods, which accept generator functions as iterator functions, so you can `yield` from within them.  Underlying implementations courtesy of the fantastic [async](https://github.com/caolan/async) library, which has more documentation.

#### async.forEach(arr, fn\*)

Applies `fn*` as an iterator to each item in `arr`, in parallel.  Aliased as `async.each`.

```js
var fs = async.require('fs');

async.run(function*() {

	var filenames = [...];
	var totalBytes = 0;

	yield async.forEach(filenames, function*(filename) {
		var stat = yield fs.stat(filename);
		totalBytes += stat.size;
		console.log(filename, stat.size);
	});

	console.log("Total bytes:", totalBytes);
});
```

#### async.eachLimit(arr, limit, fn\*)

Same as `async.forEach` except that only `limit` iterators will be simultaneously running at any time.

#### async.map(arr, fn\*)

Produces a new array of values by mapping each value in arr through the generator function.

```js
async.run(function*() {

	var filenames = [...];

	var existences = yield async.map(filenames, function*(filename) {
		return yield fs.exists(filename);
	});

	console.log(existences); // => [ true, true, false, true, ... ]
});

```
#### async.mapLimit(arr, limit, fn\*)

Same as `async.map` except that only limit iterators will be simultaneously running at any time.

#### async.filter(arr, fn\*)

Returns a new array of all the values in arr which pass an async truth test.

```js
async.run(function*() {

	var filenames = [...];

	var bigFiles = yield async.filter(filenames, function*(filename) {
		var stat = yield fs.stat(filename);
		return stat.size > 1024;
	});

	console.log("Big files:", bigFiles);
});
```

#### async.reject(arr, fn\*)

The opposite of `async.filter`. Removes values that pass an async truth test.

#### async.reduce(arr, memo, fn\*)

Reduces `arr` into a single value using an async iterator to return each successive step. `memo` is the initial state of the reduction.  Runs in series.

#### async.reduceRight(arr, memo, fn\*)

Same as `async.reduce`, only operates on arr in reverse order.

#### async.detect(arr, fn\*)

Returns the first value in `arr` that passes an async truth test. The generator function is applied in parallel, meaning the first iterator to return true will itself be returned.

#### async.sortBy(arr, fn\*)

Sorts a list by the results of running each arr value through an async generator function.

```js
async.run(function*() {

	var filenames = [...];

	var sortedFiles = yield async.filter(filenames, function*(filename) {
		var stat = yield fs.stat(filename);
		return stat.size;
	});

	console.log("Sorted files:", sorted);
});
```

#### async.some(arr, fn\*)

Returns true if at least one element in the arr satisfies an async test.

#### async.every(arr, fn\*)

Returns true if every element in arr satisfies an async test. 

#### async.concat(arr, fn\*)

Applies iterator to each item in arr, concatenating the results. Returns the concatenated list.


## History and Inspiration

This is an evolution of [gx](https://github.com/dchester/gx), with inspiration from other generator-based control flow libraries such as [co](https://github.com/visionmedia/co), [genny](https://github.com/spion/genny), [galaxy](https://github.com/bjouhier/galaxy), and [suspend](https://github.com/jmar777/suspend).


## License

Copyright (c) 2015 David Chester

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
