var handlebars = require('handlebars')

module.exports = {
	readContextPath: function (context, path) {
				path = path.replace(/\[/g,".").replace(/\]/g,"")
				var parts = path.split('.');
				var data = context;
				var part;

				while(part = parts.shift()) {
					data = data[part];
					if (data === undefined) {
						return undefined;
					}
				}

				return data;
	},

	readValue: function(pathOrValue, context) {
		if ("@" == pathOrValue) return context;

		if ("string" === typeof pathOrValue && pathOrValue[0] == '@') {
			return module.exports.readContextPath(context, pathOrValue.slice(1))
		}

		if ("object" === typeof pathOrValue && "template" in pathOrValue) {
			var template = pathOrValue.template;
			var compiled = handlebars.compile(template);
			return compiled(context);
		}
		return pathOrValue;
	},

	setValue: function(object, path, value) {
		var parts = path.split('.');
		var part;
		while(part = parts.shift()) {
			if (parts.length) {
				object[part] = object[part] || {};
				object = object[part];
			} else {
				object[part] = value;
			}
		}
	}
}
