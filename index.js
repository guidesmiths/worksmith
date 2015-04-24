var debug = require('debug')('workflow:common')
var _ = require('lodash')
var path = require('path')
var hadlebars = require('handlebars')

var workflow =  {

    getTaskType: function(taskType) {
        return require('./tasks/' + taskType + '.js')
    },

    define: function (workflowDefinition) {
        debug("workflow defining: %s", workflowDefinition.task)
        var task = module.exports.getTaskType(workflowDefinition.task)
        var wfInstance = task(workflowDefinition)
        //return wfInstance

        return function(context) {
            var decorated = wfInstance(context);
            var executed = false;
            debug("workflow preparing: %s", workflowDefinition.task)



            return function(done) {
                //TODO: debug console.log("wrapped wf activity inside");
                //if ("resultTo" in workflowDefinition) {
                var orig = done,
                done = function(err, result) {
                    if (executed && workflowDefinition.resultTo) {
                        utils.setValue(context, workflowDefinition.resultTo, result);
                    }
                    debug("workflow executed: %s", workflowDefinition.task)
                    orig(err, result);
                }
                //}

                function checkCondition() {
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

                debug("workflow executing: %s", workflowDefinition.task)
                if (checkCondition()) {
                    executed = true;
                    try {
                        return decorated(done);
                    } catch(err) {
                        throw err;
                        return done(err)
                    }
                }

                done();
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