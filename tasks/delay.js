var debug = require('debug')('workflow:activities:delay')
module.exports = function(node) {
    return function(context) {

        execute.annotations = {inject: ["duration"]}

        function execute(duration, done) {
            debug("delay activity started %s", duration)
            setTimeout(done, parseInt(duration));
        }

        return execute
    }
}