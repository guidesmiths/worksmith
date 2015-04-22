var utils = require('./utils.js')
var debug = require('debug')('workflow:activities:log')


//TODO:set logger framework parametrizable
//params
//message: the dynatext to display

module.exports = function (node) {

	var LogActivity = function(context) {
		return function(done) {
			console.log("LOG>", utils.readValue(node.message || "Log activity", context))
			done();
		}		
	}

	return LogActivity;
}