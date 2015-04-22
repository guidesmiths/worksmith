var async = require('async')
var workflow = require('./')

module.exports = function(node) {
	return function(context) {
		return function(done) {
			var tasks = node.items.map(function(item) {
				return workflow.define(item)(context)
			})
			async.parallel(tasks,done)
		}
	}
}
