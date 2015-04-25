var debug = require('debug')('workflow:activities:sql:pg')
var pg = require('pg')
var _ = require('lodash')

executeSqlActivity.annotations = {inject: ["command", "params", "connection"]}
function executeSqlActivity(definition) {
    return function(context) {
        return function(command, params, connection, done) {

            pg.connect(connection, function(err, client) {
                if (err) {
                    debug("Connection error", err)
                    return done(err)
                }
                debug("sql connected")
                function handleResult(err, result) {
                    if (err) return done(err);
                    client.end();
                    //dbDone();
                    debug("passing result to chain", typeof result)
                    done(null, result);
                }
                var p = params.slice()
                debug("executing sql command %s ", command, params)
                client.query(command, p || [], handleResult)
            });
        }
    }
}

module.exports = executeSqlActivity