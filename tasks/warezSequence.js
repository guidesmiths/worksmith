var async = require('async')
var workflow = require('./')

module.exports = function(node) {
	return function(context) {
		return function(done) {
			var tasks = node.items.map(function(item) {
				return workflow.define(node.warez[item])(context)
			})
			async.series(tasks,done)
		}
	}
}
