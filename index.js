var debug = require('debug')('workflow:common')
var _ = require('lodash')
var path = require('path')
var handlebars = require('handlebars')
var fs = require('fs')
var async = require('async')
var util = require('util')

var taskTypeCache = {};
var DEFAULT_TASK_PATH = "/src/tasks/"
var taskPath
var resolvers = {};

var settings  = {
    logger: console
}

var interpolate = require('./src/interpolation').interpolate

var worksmith

function wfLoader(wf) {
    if ("string" === typeof wf) {
        wf = path.resolve(wf)
        debug("loading workflow file: %s", wf)
        wf = require(wf);
    }
    if(Array.isArray(wf)) {
        wf = {
            task: "sequence",
            items: wf
        }
    }
    return worksmith.define(wf);
}

worksmith = wfLoader

function getStepName(step) {
    if (step.name) { return step.name }
    var name = step.name || step.task;
    if ("function" === typeof name) {
        name =  "<Anonymous>" + name.name
    }
    return step.name = name;
}

var workflow = {

    use: function(ns, taskLibrary) {
        resolvers[ns] = taskLibrary;
    },

    createAdapter: function(object) {
        return function getType(name) {
            var method = object[name];
            return function define(step) {
                return function build(context) {
                    return function execute(done) {
                        var args = (context.get(step.arguments) || [])
                        var result = method.apply(object, args)
                        done(undefined, result);
                    }
                }
            }
        }
    },
    configure: function(options) {
        _.assignIn(settings, options);
    },

    hasLogLevel: function(level) {
        return settings.logger[level] !== undefined
    },

    log: function() {
        var level = arguments[0]
        settings.logger[level].apply(settings.logger, Array.prototype.slice.call(arguments,1))
    },
    discoverTaskType: function(taskType) {
        var processRelativePath = path.join(process.cwd(), taskPath, taskType + ".js");
        return fs.existsSync(processRelativePath) ? processRelativePath : "./tasks/" + taskType + ".js";
    },

    getTaskType: function(taskType) {
        if (taskType.indexOf("/") > -1) {
            var taskSpec = taskType.split("/");
            var ns = taskSpec[0];
            if (resolvers[ns]) {
                return resolvers[ns](taskSpec[1]);
            }
        }
        var taskFile = taskTypeCache[taskType] || (taskTypeCache[taskType] = workflow.discoverTaskType(taskType))
        return require(taskFile);
    },

    getWorkflow: function(task) {
        if ("string" === typeof task) return workflow.getTaskType(task);
        return task;
    },



    define: function (workflowDefinition) {

        debug("defining: %s", getStepName(workflowDefinition))
        taskPath = workflowDefinition.taskPath || DEFAULT_TASK_PATH
        var WorkflowType = workflow.getWorkflow(workflowDefinition.task)

        var wfInstance = WorkflowType.call(wfLoader, workflowDefinition)

        function checkCondition(context) {
            if (!("condition" in workflowDefinition)) {
                return true;
            }
            with(context) {
                if (eval(workflowDefinition.condition)) {
                    return true;
                }
                return false;
            }

        }

        function initializeContext(context) {
            if (!context.initialized) {
                context.get = function(name, interpolate) {
                    return workflow.readValue(name, this, interpolate)
                },
                context.set = function(name, value) {
                    return workflow.setValue(this, name, value)
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
            annotations.inject && annotations.inject.forEach(function(injectable) {
                if ("string" === typeof injectable) {
                    injectable = {
                        name: injectable,
                        interpolationPolicy: true,
                    }
                }
                var arg;
                switch(injectable.name[0]) {
                    case '@': arg = context.get(injectable.name); break;
                    default: arg = context.get(workflowDefinition[injectable.name],injectable.interpolationPolicy); break;
                }
                args.push(arg)
            })
            return args;

        }

        return function build(context) {
            if (arguments.length == 2) {
                return build(arguments[0])(arguments[1])
            }
            initializeContext(context)
            var decorated = wfInstance(context)
            debug("preparing: %s", getStepName(workflowDefinition))


            var markWorkflowTerminate = function(done) {
                context.completionStack = context.completionStack || []
                context.completionStack.push(done)
                if (!context.workflowTerminate) {
                    context.workflowTerminate = done
                }
            }


            return function execute(done) {
                var wfStartTime = new Date().getTime()

                if (!checkCondition(context))
                    return done()

                markWorkflowTerminate(done)

                function invokeDecorated(err, res, next) {
                    function createExecutionThisContext() {
                        return {
                            workflow: {
                                terminate: function(err, res, next) {
                                    context.originalTerminate = done
                                    done = context.workflowTerminate
                                    next(err, res)
                                },
                                terminateParent: function(err, res, next, step) {
                                    context.originalTerminate = done
                                    done =  context.completionStack[context.completionStack.length - (step || 2)]
                                    next(err, res)
                                }
                            }
                        }
                    }

                    var args = getArgumentsFromAnnotations(context, decorated, wfInstance)
                    args.push(next)
                    try {
                        decorated.apply(createExecutionThisContext(), args)
                    } catch(ex) {
                        next(ex)
                    }
                }

                function onError(err, res, next) {
                    if (!err) { return next(err, res) }
                    var errorWfDef = context.get(workflowDefinition.onError);
                    var errorWf = workflow.define(errorWfDef);
                    context.error = err;
                    errorWf(context, function(errHandlerErr, errRes) {
                        if (errorWfDef.handleError) err = errHandlerErr;
                        next(err, res);
                    })
                }

                function onComplete(err, res, next) {
                    var finallyDef = context.get(workflowDefinition.finally);
                    var finallyWf = workflow.define(finallyDef);
                    finallyWf(context, function(finErr, finRes) {
                        next(err, res)
                    })
                }
                function logErrors(err, result, next) {
                    if (err) {
                        debug("error in workflow %s, error is %o", getStepName(workflowDefinition), err.message || err)
                        //make logging errors a configation options
                        //if (!err.supressMessage) {
                        //    worksmith.log("error",util.format("Error in WF <%s>, error is:<%s> ", getStepName(workflowDefinition), err.message),err)
                        //}
                    }
                    next(err, result)
                }

                function setWorkflowResultTo(err, result, next) {
                    if (err) { return next(err, result) }
                    process.env.WSDEBUGPARAMS && debug("...result is", result)
                    context.set(workflowDefinition.resultTo, result)
                    next(err, result)
                }

                function buildUpMicroworkflow() {
                    var tasks = [invokeDecorated];
                    workflowDefinition.onError && tasks.push(onError)
                    workflowDefinition.finally && tasks.push(onComplete)
                    workflowDefinition.resultTo && tasks.push(setWorkflowResultTo)
                    tasks.push(logErrors)
                    return tasks;
                }

                var tasks = buildUpMicroworkflow();

                function executeNextThunkOrComplete(err, res) {
                    var thunk = tasks.shift();
                    if (thunk) {
                        return thunk( err, res, executeNextThunkOrComplete)
                    }

                    debug("Finished executing WF %s", getStepName(workflowDefinition))
                    if (context.$$$stats) {
                      context.$$$stats.push(getStepName(workflowDefinition) + " execution time: " + (new Date().getTime() - wfStartTime) +"ms")
                    }
                    var originalDone = context.originalTerminate || done;
                    var donePosition = context.completionStack.indexOf(originalDone);
                    context.completionStack.splice(donePosition, 1)
                    setImmediate(function() {
                        done(err, res, context)
                    })
                }

                debug("Executing WF %s", getStepName(workflowDefinition))
                return executeNextThunkOrComplete()

            }
        }
    },

    readValue: function(pathOrValue, context, interpolationPolicy) {
        return interpolate(context, pathOrValue, interpolationPolicy)
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
                object[part] = value;
            }
        }
    }


}


_.assignIn(wfLoader, workflow);

module.exports = wfLoader;