var _ = require('lodash')

module.exports = function(definition) {
    return function build(context) {

        execute.annotations = { inject: ['size', 'depth', 'prefix'] }

        function execute(size, depth, prefix, done) {
            var objects = []
            _.times(size, function(n) {
                objects.push(createDeepObject(depth))
            })
            done(null, objects)

            function createDeepObject(level) {
                if (level < 0) return { value: _.random(0, 10000)}
                var newLevel = {}
                newLevel[prefix + level] = createDeepObject(level - 1)
                return newLevel
            }
        }


        return execute
    }
}