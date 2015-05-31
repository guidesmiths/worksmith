var debug = require('debug')('workflow:activities:log')

LogActivty.annotations = {inject: ["message"]}

function LogActivty(node) {
    var worksmith = this;
    return function (context) {
        return function(message, done) {
            worksmith.log("log", message || "Log activity")
            done();
        }
    }

}
module.exports = LogActivty