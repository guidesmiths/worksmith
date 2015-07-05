var handlebars = require('handlebars')

var Parser = require('./Parser.js')
var Interpolator = require('./Interpolator.js')

var defaults = {
    tagSearcher : /\[([^\]]*)\](.+?)\[\/\1\]/g,
    markupHandlers: {
        'eval': function(context, source) {
            with(context) {
                return eval(source)
            }
        },
        'hbs': function(context, source) {
            //we need hash based caching here
            var compiled = handlebars.compile(source);
            return compiled(context);
        }
    }
}

var parserInstance = new Parser(defaults.tagSearcher, defaults.markupHandlers)
var interpolatorInstance = new Interpolator(parserInstance)

module.exports = {
    defaults: defaults,
    Parser: Parser,
    Interpolator: Interpolator,
    parse: parserInstance.parse,
    interpolate: interpolatorInstance.interpolate
}