var debug = require(                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    'debug')('workflow:common')
var _ = require('lodash')
var path = require('path')
var handlebars = require('handlebars')

var workflow =  {

    getTaskType: function(taskType) {
        return require('./tasks/' + taskType + '.js')
    },



    define: function (workflowDefinition) {
        debug("defining: %s", workflowDefinition.task)
        var WorkflowType = module.exports.getTaskType(workflowDefinition.task)
        var wfInstance = WorkflowType(workflowDefinition)


        function checkCondition(context) {
            if (!("condition" in workflowDefinition)) {
                return true;
            }
            with(context) {
                var result = eval(workflowDefinition.condition)
                if (result) {
                    return true;
                }
                return false;
            }

        }

        function initializeContext(context) {
            if (!context.initialized) {
                context.get = function(name) {
                    return workflow.readValue(name, context)
                },
                context.set = function(name, value) {
                    return workflow.setValue(context, name, value)
                }
                context.initialized = true;
            }

        }

        function getArgumentsFromAnnotations(context) {
            var args = [];
                WorkflowType.annotations && WorkflowType.annotations.inject &&
                    WorkflowType.annotations.inject.forEach(function(name) {
                        args.push(context.get(workflowDefinition[name]))
                    })
            return args;

        }

        return function build(context) {
            var decorated = wfInstance(context)
            debug("preparing: %s", workflowDefinition.task)

            initializeContext(context)

            return function execute(done) {


                if (!checkCondition())
                    return done()

                var orig = done,
                done = function(err, result) {
                    debug("completed")
                    if (workflowDefinition.resultTo) {
                        process.env.WSDEBUGPARAMS && debug("...result is", result)
                        workflow.setValue(context, workflowDefinition.resultTo, result)
                    }
                    debug("executed: %s", workflowDefinition.task)
                    orig(err, result);
                }


                debug("executing: %s", workflowDefinition.task)
                try {
                    var args = getArgumentsFromAnnotations(context)
                    args.push(done)
                    process.env.WSDEBUGPARAMS && debug("...invocation arguments", args)
                    return decorated.apply(this, args);
                } catch(err) {
                    //throw err;
                    return done(err)
                }

            }
        }
    },

    readContextPath: function (context, path) {
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
    },

    readValue: function (pathOrValue, context) {
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

    setValue: function (object, path, value) {
        var parts = path.split('.');
        path = path.replace(/\[/g, ".").replace(/\]/g, "")
        var part;
        while (part = parts.shift()) {
            if (parts.length) {
                object[part] = object[part] || {};
                object = object[part];
            } else {

                var mapDef = value

                // var result
                // var builders = {
                //     "[object Array]": function(o) {
                //         return o.map(function(item) {
                //             return workflow.readValue(item, object)
                //         })
                //     },
                //     "[object Object]": function(o) {
                //         var result = {}
                //          Object.keys(o).forEach(function(key) {

                //             result[key] = workflow.readValue(key, object)
                //         })
                //          return result
                //     }
                // }

                // value = (builders[Object.prototype.toString.call(mapDef)] || (function(o) { return o })) (mapDef)


                object[part] = value;
            }
        }
    }


}

function wfLoader(wf) {
    if ("string" === typeof wf) {
        wf = path.relative(__dirname, path.resolve(wf))
        debug("loading workflow file: %s", wf)
        wf = require(wf);
    }
    return workflow.define(wf);
}
_.extend(wfLoader, workflow);

module.exports = wfLoader;