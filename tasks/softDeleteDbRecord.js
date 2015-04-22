var utils = require('./utils.js')
var debug = require('debug')('workflow:activities:db:insert')
var sqlutils = require('../utils.js')
var pg = require('pg')
//task options
//connectionString: 
//table
//data
//resultTo

module.exports = function(node) {
	return function (context) {

		return function(done) {
			var keys = utils.readValue(node.keys, context)
			var tableName = utils.readValue(node.table, context)
			var connection = utils.readValue(node.connection, context)

			debug("soft deleting to %s::%s data object: %o", connection, tableName, keys)
			var sql = sqlutils.getSoftDeleteSql(tableName, keys)
			//TODO: refactor to connection-factory pattern

			pg.connect(connection, function(err, client, dbDone) {
				if (err) return done(err);
				debug("will execute %o", sql)
				client.query(sql.sql, sql.params, function(err, result) {
					client.end();
					dbDone();
					if (err) return done(err);
					done(null, result);
				})

			})
		}
	}
}