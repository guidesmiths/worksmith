var worksmith = require('..')
var _ = require('lodash')
var async = require('async')
packageJson = require('../package.json')

console.log('Stress tests for worksmith version ', packageJson.version)

var SAMPLE_SIZE = 100

try {
    worksmith.use("lodash", worksmith.createAdapter(require('lodash')))
    var workflow = worksmith("./stress-test/stress-workflows/workflow1.js")
    console.log('About to execute workflow1')
    calculateAverageExecTime(workflow, function(average) {
        console.log('The average execution time is: ', average, ' ms')
    })
} catch(e) {
    console.error('There was an error setting up a workflow: ', e)
}

function calculateAverageExecTime(workflow, next) {
    var average = counter = 0
    async.whilst(
        function () { return counter < SAMPLE_SIZE },
        function (cb) {
            counter++;
            var ctx = {}
            workflow(ctx, function(err, results) {
                if (err) return cb(err)
                average += ctx.duration
                cb()
            })
        },
        function (err) {
            if (err) console.error('There was an error running a workflow: ', err.toString())
            next(average / SAMPLE_SIZE)
        }
    )
}