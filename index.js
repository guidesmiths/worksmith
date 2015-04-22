var utils = require('./utils.js')
var debug = require('debug')('workflow:common')
var _ = require('lodash')
var path = require('path')

var workflow =  {

	getTaskType: function(taskType) {
		return require('./' + taskType + '.js')
	},

	define: function(workflowDefinition) {
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
				if ("resultTo" in workflowDefinition) {
					var orig = done,
						done = function(err, result) {
							if (executed) {
								utils.setValue(context, workflowDefinition.resultTo, result);
							}
							orig(err, result);
						}
				}

				if ("condition" in workflowDefinition) {
					//TODO: debug console.log("conditional activity hmm good", workflowDefinition.condition)
					with(context) {
						var result = eval(workflowDefinition.condition)
						if (result) { 
							debug("workflow executing: %s", workflowDefinition.task)
							executed = true;
							return decorated(done);
						}
						return done();
					}
				}
				debug("workflow executing: %s", workflowDefinition.task)
				executed = true;
				decorated(done);	
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