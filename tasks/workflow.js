var debug = require('debug')('worksmith:activities:workflow')

var worksmith = require('../')

module.exports = function(node) {

    return function build(context) {
            
        function execute(done) {
            var wfs = context.get(node.source);
            var wf = worksmith(wfs);
            var ctx = context.get(node.context) || context;
            wf(ctx, done)
        }

        return execute;

    }
}
