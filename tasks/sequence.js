var async = require('async')
var workflow = require('../')

module.exports = function(node) {

    var steps = node.items.map(function(item) {
            return workflow.define(item)
        })

    return function build(context) {

        var tasks = steps.map(function(step) {
            return step(context);
        })

        function execute(done) {
            async.series(tasks,done)
        }

        return execute;

    }
}
