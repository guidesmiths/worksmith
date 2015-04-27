var hb = require('handlebars')
var workflow = require('../')
var debug = require('debug')('workflow:activities:set')

setActivity.annotations = {inject: ["name","value"]}
function setActivity(node) {
    return function (context) {
        return function(name, value, done) {
            debug("setting value %s as %s", value, node.name)
            context.set(name, value)
            done();
        }
    }
}
module.exports = setActivity