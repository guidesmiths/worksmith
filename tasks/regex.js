var debug = require('debug')('workflow:activities:log')
var xregexp = require('xregexp')
var XRegExp = xregexp.XRegExp

module.exports = function (node) {
    
    //TODO: refactor and place this to wf creator level
    Object.keys(node).forEach(function (key) {
        if (key[0] === ">") {
            node.value = node[key];
            node.resultTo = key.slice(1);
            delete node[key]
        }
    });    
    //for performance considerations the regex pattern should be constructed w/o using context variables
    var p = XRegExp(node.pattern,'x');

    return function(context) {
        return function(done) {
            var str = context.get(node.value);
            var match = XRegExp.exec(str, p);
            done(null, match);
        }
    }

}