var _ = require('lodash')
var fs = require('fs')

var path = require('path')
module.exports = function(definition) {
    return function(context) {
        return function(done) {
            var fsPath = context.get(definition.path)
            var content = fs.readFileSync(fsPath).toString()
            done(null, content)
        }
    }
}