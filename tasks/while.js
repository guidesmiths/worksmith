var workflow = require('../')
var async = require('async')

function whileActivity(node) {
    return function (context) {
        execute.inject = [{name: "subflow", interpolationPolicy: false } ] 
        function execute(subflow, done) {
            var result
            async.whilst(function() {
                return context.get(node.test)
            }, function(cb) {
                setImmediate(function() {
                    workflow(subflow)(context, function(err, _result) {
                        if (err) return cb(err)
                        result = _result
                        cb()
                    })
                })
            }, function(err) {
                done(err, result)
            })
        }
        return execute;
    }
}

module.exports = whileActivity