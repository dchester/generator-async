var Context = function(generator, args, _this) {

  if (!generator) throw new Error("Context needs a generator function");

  this.queue = [];
  this.callback = function() {};
  this.pendingCount = 0;
  this.iterator = generator.apply(_this, args);
};

Context.prototype = {

  run: function(callback) {
    this.callback = callback || this.callback;
    this.continue();
  },

  continue: function(payload, err) {

    try {
      Context.stack.set(this);

      var ret = err ? 
        this.iterator.throw(err) :
        this.iterator.next(payload);

      var value = ret.value;

      if (ret.done) {
        this.callback(null, value);
        this._done = true;
      } else if (value && value instanceof Object && value._id == '__async') {
        // do nothing
      } else if (is_promise(value)) {
        var callback = this.cb();
        value.then(function(resolution) {
          callback(null, resolution);
        }).catch(callback);
      } else if (value instanceof Function) {
        var transform = value.async ? value.async.transform : undefined;
        value.call(null, this.cb(transform));
      } else {
        throw new Error("Attempted to yield bad value: " + value);
      }

      Context.stack.clear();

    } catch(e) {
      throw e && e.stack ? e.stack : e;
      Context.stack.clear();
    }
  },

  cb: function(transform) {
    if (this._done) return;

    var placeholder = {};

    this.pendingCount++;
    this.queue.push(placeholder);

    transform = transform || function(args) { return args };

    return function() {

      var results = transform(arguments);
      var err = results[0];
      var data = results[1];

      if (err) {
        console.warn("WARN", err);
        err = new Error(err);
      }

      placeholder.value = data;
      if (--this.pendingCount !== 0) return;

      var len = this.queue.length;

      while (len--) {
        // push a dummy operation onto the next frame of the event loop
        setImmediate(function() {});

        var d = this.queue.shift();
        this.continue(d.value, err);
      }

    }.bind(this);
  }
};

Context.stack = {

  stack: [],

  active: function() {
    return this.stack[this.stack.length - 1]
  },

  set: function(context) {
    this.stack.push(context);
  },

  clear: function() {
    this.stack.pop();
  }
};

function is_promise(fn) {
  return fn && typeof fn == "object" && typeof fn.then == "function";
};

module.exports = Context;
