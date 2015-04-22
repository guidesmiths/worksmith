var utils = require('./utils.js')
var debug = require('debug')('workflow:activities:log')
var xregexp = require('xregexp')
var XRegExp = xregexp.XRegExp

//TODO:set logger framework parametrizable
//params
//value
//pattern
//resultTo

module.exports = function (node) {

	return function(context) {
		return function(done) {
			var p = XRegExp(node.pattern,'x');
			var str = utils.readValue(node.value, context);
			var match = XRegExp.exec(str, p);
			done(null, match);
		}		
	}

}