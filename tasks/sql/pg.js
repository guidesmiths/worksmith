var debug = require('debug')('workflow:activities:sql:pg')
var pg = require('pg')
var _ = require('lodash')


function executeSqlActivity(definition) {
    return function build(context) {

        execute.annotations = {inject: ["command", "params", "connection"]};
        function execute(command, params, connection, done) {

            pg.connect(connection, function(err, client) {
                if (err) {
                    debug("Connection error", err)
                    return done(err)
                }
                function handleResult(err, result) {
                    if (err) return done(err);
                    client.end();
                    done(null, result);
                }
                
                params = params || [];
                debug("@@@@", params)
                var p = params.map(function(value) {
                    return context.get(value);
                })
                debug("executing sql command %s ", command, p)
                //console.log("@@@@@@@@@", p)
                client.query(command, p, handleResult)
            });
        }
        return execute;
    }
}

module.exports = executeSqlActivity