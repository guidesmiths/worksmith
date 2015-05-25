var path = require('path')
module.exports = function(definition) {
    return function(context) {
        return function(done) {
            var jsonPath = context.get(definition.path)
            jsonPath = path.resolve(jsonPath)
            var content = require(jsonPath)
            done(null, content)
        }
    }
}