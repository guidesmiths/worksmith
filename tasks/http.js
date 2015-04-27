var request = require('request')



function HttpActivity(definition) {
    return function(context) {
        return function(done) {
            var method = context.get(definition.method) || 'GET'
            done()
        }
    }
}

module.exports = HttpActivity