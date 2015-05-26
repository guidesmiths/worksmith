var debug = require('debug')('workflow:activities:log')

LogActivty.annotations = {inject: ["message"]}
function LogActivty(node) {

    return function (context) {

        return function(message, done) {
            console.log(message || "Log activity")
            done();
        }
    }

}
module.exports = LogActivty