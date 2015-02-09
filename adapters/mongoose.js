module.exports = function(mongoose) {
  var async = require('..');
  var _hook = mongoose.constructor.prototype.Document.prototype.hook;
  mongoose.constructor.prototype.Document.prototype.hook = function(name) {
    _hook.apply(this, arguments);
    this[name] = async.proxy(this[name]);
  };
}
