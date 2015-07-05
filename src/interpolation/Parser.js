function Parser(tagSearcher, markupHandlers) {
    
    function getStringPartThunk(stringValue, start, end) {
        return function() { 
            return stringValue.substr(start, end) 
        }
    }
    
    function getTagHandlerThunk(match, tag, content, handlers){
        function tagHandlerThunk(context) {
            var handler = handlers[tag];
            if (!handler) {
                return match;
            }
            return handler(context, content)
        }
        tagHandlerThunk.source = {
            tag:tag, 
            content: content
        }
        return tagHandlerThunk
    }
    
    this.parse = function(stringValue, handlers) {
        var pointer = 0
        var chops = []
        handlers = handlers || markupHandlers
        stringValue.replace(tagSearcher, function(match, tag, content, position) {
            if (position > pointer) {
                chops.push(getStringPartThunk(stringValue, pointer, position))
            }
            chops.push(getTagHandlerThunk(match, tag, content, handlers))
            pointer = position + match.length;
            return match 
        })
        if (pointer < stringValue.length) {
            chops.push(function() { return stringValue.substr(pointer, stringValue.length) })
        }
        return chops;
    }
    
    this.assemble = function(context, parserResult) {
        var chops = parserResult
        if (chops.length == 1) {
            return chops[0](context);
        }
        return chops.map(function(piece) {
            return piece(context)
        }).join('');
    }

}

module.exports = Parser