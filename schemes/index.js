var semver = require('semver');

module.exports = {

	register: function(module, version, scheme) {
		var key = [module, version].filter(function(x) { return x }).join('@');
		this.schemes[key] = scheme;
	},

	scheme: function(name, version) {

		var matches = [];

		Object.keys(this.schemes).forEach(function(key) {
			var comps = key.split('@');
			var _name = comps[0];
			var _version = comps[1] || '*';
			if (name == _name && (version == '*' || semver.satisfies(version, _version))) {
				matches.push(this.schemes[key]);
			}
		}.bind(this));

		var scheme = {};

		matches.forEach(function(match) {
			for (key in match) {
				scheme[key] = match[key];
			}
		});

		return scheme;
	},

	schemes: require('./schemes')
};
