var workflow = require('../')
var debug = require('debug')('workflow:activities:log')


//TODO:set logger framework parametrizable
//params
//message: the dynatext to display

module.exports = function (node) {

    return function (context) {

        return function(done) {
            console.log("LOG>", workflow.readValue(node.message || "Log activity", context))
            done();
        }
    }

}