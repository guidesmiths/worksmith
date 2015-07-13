var debug = require('debug')('workflow:activities:log')

LogActivity.annotations = { inject: ["message", "level"] }

function LogActivity(node) {
    var worksmith = this;
    return function (context) {
        return function(message, level, done) {
            level = level || (worksmith.hasLogLevel("log") ? "log" : "info")
            if (!worksmith.hasLogLevel(level)) return done(new Error("The configured logger has no method " + level))
            worksmith.log(level, message || "Log activity")
            done()
        }
    }

}
module.exports = LogActivity