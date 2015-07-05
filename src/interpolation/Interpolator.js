var handlebars = require('handlebars')

function Interpolator(parser) {
    var self = this


    this.readContextPath = function(context, path) {
        path = path.replace(/\[/g, ".").replace(/\]/g, "")
        var parts = path.split('.');
        var data = context;
        var part;
        while (part = parts.shift()) {
            data = data[part];
            if (data === undefined) {
                return undefined;
            }
        }
        return data;
    }

    this.interpolateString = function(context, value) {
        return parser.assemble(context, parser.parse(value))
    },
    

    this.interpolate = function(context, value) {
            var index = 0
            var matched = false
            var interpolationRules = self.rules[Object.prototype.toString.call(value)]
            if (!interpolationRules)  
                return value

            while(index < interpolationRules.length && !( matched = interpolationRules[index].match(value) )) index++

            if (!matched) 
                return value

            return interpolationRules[index].action(self, context, value)
    }
}

Interpolator.prototype.rules = {
    "[object String]": [
        {
            name: "context reference",
            match: function(value) {("@" === value) },
            action: function(interpolator, context, value) { return context } 
        },
        {
            name: "context member reference",
            match: function(value) { return value[0] == '@' },
            action: function(interpolator, context, value) { return interpolator.readContextPath(context, value.slice(1)) }
        },
        {
            name: "markup resolver",
            match: function(value) { return value.indexOf("[") > -1 },
            action: function(interpolator, context, value) { return interpolator.interpolateString(context, value) }
        }],
    "[object Array]": [
        {
            name: "object field interpolator",
            match: function(value) { return true },
            action: function(interpolator, context, value) { 
                var result = []
                for (var index = 0; index < value.length; index++) {
                    result.push(interpolator.interpolate(context, value[index]))
                }
                return result
            }
        }],
    "[object Object]": [
        {
            name:"no-process wrapper",
            match: function(value) { return "_np_" in value},
            action: function(interpolator, context, value) { return value["_np_"] }
        },
        {
            name: "legacy {template:'...'} field resolver",
            match: function(value) { return "template" in value },
            action: function(interpolator, context, value) { 
                console.warn("obsoleted functionality: { template: value }, use [hbs]..[/hbs] instead")
                var template = value.template
                var compiled = handlebars.compile(template)
                return compiled(context);
            }
        },
        {
            name: "object field interpolator",
            match: function(value) { return true },
            action: function(interpolator, context, value) { 
                var result = {}
                var keys = Object.keys(value)
                for (var index = 0; index < keys.length; index++) {
                    var key = keys[index]
                    result[key] = interpolator.interpolate(context, value[key])
                }
                return result
            }
        }]
}


module.exports = Interpolator
