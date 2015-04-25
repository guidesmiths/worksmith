
function executeSqlActivity(definition) {
    return function(context) {
        return function(done) {
            var sqlText = context.get(definition.sql),
                params = context.get(definition.params)

        }
    }
}

module.exports = executeSqlActivity