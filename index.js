var debug = require(                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    'debug')('workflow:common')
var _ = require('lodash')
var path = require('path')
var handlebars = require('handlebars')
var fs = require('fs')

var taskTypeCache = {};

var workflow =  {

    discoverTaskType: function(taskType) {
        var processRelativePath = path.join(process.cwd(), "/src/tasks/", taskType + ".js");
        return fs.existsSync(processRelativePath) ? processRelativePath : "./tasks/" + taskType + ".js";
    },

    getTaskType: function(taskType) {
        var taskFile = taskTypeCache[taskType] || (taskTypeCache[taskType] = workflow.discoverTaskType(taskType))
        return require(taskFile);
    },

    getWorkflow: function(task) {
        if ("string" === typeof task)
            return workflow.getTaskType(task);
        return task;
    },

    define: function (workflowDefinition) {

        debug("defining: %s", workflowDefinition.task)
        var WorkflowType = workflow.getWorkflow(workflowDefinition.task)

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

        function getArgumentsFromAnnotations(context, execute, build) {
            var args = [];
            //TODO: this line is reallly just interim. annotations should be merged or something
            var annotations = execute.annotations || build.annotations || WorkflowType.annotations;
            annotations = annotations || {};
            execute.inject && (annotations.inject = execute.inject);
            annotations.inject && annotations.inject.forEach(function(name) {
                var arg;
                switch(name[0]) {
                    case '@': arg = context.get(name); break;
                    default: arg = context.get(workflowDefinition[name]); break;
                }
                args.push(arg)
            })
            return args;

        }

        return function build(context) {
            if (arguments.length == 2) {
                return build(arguments[0])(arguments[1])
            }
            var decorated = wfInstance(context)
            debug("preparing: %s", workflowDefinition.task)

            initializeContext(context)

            return function execute(done) {


                if (!checkCondition(context))
                    return done()

                var orig = done,
                done = function(err, result) {
                    if (err) {
                        if (!err.supressMessage) {
                            console.error("Error in WF <%s>, error is:<%s> ", workflowDefinition.task, err.message || err)
                        }
                        return orig(err)
                    }
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
                    var args = getArgumentsFromAnnotations(context, decorated, wfInstance)
                    args.push(done)
                    process.env.WSDEBUGPARAMS && debug("...invocation arguments", args)
                    return decorated.apply(this, args);
                } catch(err) {
                    throw err;
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
                //TODO:
                var mapDef = value

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


