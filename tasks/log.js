var debug = require('debug')('workflow:activities:log')

module.exports = function (node) {

    return function (context) {

        return function(done) {
            console.log("LOG>", context.get(node.message) || "Log activity")
            done();
        }
    }

}