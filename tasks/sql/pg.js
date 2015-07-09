var debug = require('debug')('workflow:activities:sql:pg')
var pg = require('pg')
var _ = require('lodash')


function executeSqlActivity(definition) {
    return function build(context) {

        execute.annotations = {inject: ["command", "params", "connection"]};
        function execute(command, params, connection, done) {

            pg.connect(connection, function(err, client, dbDone) {
                if (err) {
                    debug("Connection error", err)
                    return done(err)
                }
                function handleResult(err, result) {
                    if (!err) {
                        dbDone();
                        return done(undefined, result)
                    }
                    dbDone(client)
                    return done(err);
                }
                
                params = params || [];
                var p = params.map(function(value) {
                    return context.get(value);
                })
                debug("executing sql command %s ", command, p)
                client.query(command, p, handleResult)
            });
        }
        return execute;
    }
}

module.exports = executeSqlActivity