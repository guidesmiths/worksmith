var debug = require('debug')('workflow:activities:delay')
module.exports = function(node) {
	return function(context) {
		return function(done) {
			debug("delay activity started %s", node.duration)
			setTimeout(done, parseInt(node.duration));
		}
	}
}