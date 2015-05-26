module.exports = function(definition) {
    return function(context) {
        return function(done) {
            var res = context.get(definition.return) == "string" ? Math.random().toString() : Math.random();
            done(null, res)
        }
    }
}