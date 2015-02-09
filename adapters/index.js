var semver = require('semver');

module.exports = {

  resolve: function(name, version) {

    var adapter;

    Object.keys(this.adapters).forEach(function(key) {
      var comps = key.split('@');
      var _name = comps[0];
      var _version = comps[1] || '*';
      if (name == _name && (version == '*' || semver.satisfies(version, _version))) {
              adapter = this.adapters[key];
      }
    }.bind(this));

    return adapter;
  },

  adapters: require('./adapters')

};
