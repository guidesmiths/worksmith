var debug = require('debug')('workflow:activities:map')

module.exports = function define(definition) {

    Object.keys(definition).forEach(function(key) {
        if (key[0] === ">") {
            definition.map = definition[key];
            definition.resultTo = key.slice(1);
            delete definition[key]
        }
    });
    return function build(context) {
        return function run(done) {
            var mapDef = context.get(definition.map)
            var result
            var builders = {
                "[object Array]": function(o) {
                    return o.map(context.get)
                },
                "[object Object]": function(o) {
                    var result = {}
                     Object.keys(o).forEach(function(key) {
                        result[key] = context.get(o[key])
                    })
                     return result
                }
            }
            result = builders[Object.prototype.toString.call(mapDef)](mapDef)
            done(null, result)
        }
    }
}