var workflow = require('../')
var async = require('async')

function eachSeriesActivity(node) {
    return function (context) {
        var subflowName = context.get(node.subflow)
        var subflow = workflow(subflowName)
        return function(done) {
            var items = context.get(node.items)
            var itemKey = context.get(node.itemKey) || 'item'
            var subContext = Object.create(context)
            async.eachSeries(items, function(item, cb) {
                setImmediate(function() {
                    subContext.set(itemKey, item)
                    subflow(context, cb)
                })
            }, done)
        }
    }
}

module.exports = eachSeriesActivity