module.exports = {
	fs: {
		'*': 'standard',
		exists: 'simple'
	},
	mkdirp: {
		'$': '+standard'
	},
	mongodb: {
		'MongoClient.*': 'standard',
		'Collection.prototype.*': 'standard',
		'Cursor.prototype.*': 'standard'
	},
	jsdom: {
		env: '+standard'
	},
	superagent: {
		'$': '+simple',
		'Request.prototype.end': '+simple'
	},
	'mongoose@3.8.x': {
		'$..*': 'standard',
		'~setup': require('./mongoose')
	},
	'express@4': {
		'*': null,
		'~setup': require('./express-4')
	}
};

