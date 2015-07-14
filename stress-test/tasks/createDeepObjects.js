var _ = require('lodash')

module.exports = function(definition) {
    return function build(context) {

        execute.annotations = { inject: ['size', 'depth'] }

        function execute(size, depth, done) {
            var objects = []
            _.times(size, function(n) { objects.push({ number: n }) })
            done(null, objects)
        }

        return execute
    }
}