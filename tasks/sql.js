var pg = require('pg')

function executeSqlActivity(definition) {
    return function(context) {
        return function(done) {
            var sqlText = context.get(definition.command),
                params = context.get(definition.params),
                cnStr = context.get(definition.connection)
            console.log("@@@", pg.connect)
        }
    }
}

module.exports = executeSqlActivity