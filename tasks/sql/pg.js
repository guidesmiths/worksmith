var debug = require('debug')('workflow:activities:sql:pg')
var pg = require('pg')
var _ = require('lodash')

function executeSqlActivity(definition) {
    return function(context) {
        return function(done) {
            var sqlText = context.get(definition.command),
                params = context.get(definition.params),
                cnStr = context.get(definition.connection)
            console.log(sqlText, params, cnStr)
            pg.connect(cnStr, function(err, client) {
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
                console.log("@@@@@", p, params)
                debug("executing sqlText %s ", sqlText, params)
                client.query(sqlText, p || [], handleResult)
            });
        }
    }
}

module.exports = executeSqlActivity