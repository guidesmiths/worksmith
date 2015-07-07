var workflow = require('../')
var async = require('async')

function eachSeriesActivity(node) {
    return function (context) {
        execute.inject = [{name: "subflow", interpolationPolicy: false } ] 
        function execute(subflow, done) {
            var items = context.get(node.items)
            var itemKey = context.get(node.itemKey) || 'item'
            var subContext = Object.create(context)
            async.eachSeries(items, function(item, cb) {
                setImmediate(function() {
                    subContext.set(itemKey, item)
                    workflow(subflow)(subContext, cb)
                })
            }, done)
        }
        return execute;
    }
}

module.exports = eachSeriesActivity