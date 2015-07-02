var handlebars = require('handlebars')
///logic to interpolate workflow parameter values from the context
var markupHandlers = {
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

function containsMarkup(stringValue) {
    return stringValue.indexOf("[") > -1;
}
function interpolateValue(context, value) {
    
}