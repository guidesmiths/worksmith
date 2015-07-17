var _ = require('lodash')
var async = require('async')
var requireVersion = require('require-version')
var myModule = 'worksmith'

var SAMPLE_SIZE = 10
var VERSION_LIMIT = 3

requireVersion.runLast(myModule, VERSION_LIMIT, function(module, version, next) {
    console.log('Executing tests for ', myModule, ' v', version)
    runTests(module, next)
}, function(err) {
    if (err) console.log('Error: ', err)
    console.log('END')
})

function runTests(worksmith, next) {
    try {
        worksmith.use("lodash", worksmith.createAdapter(require('lodash')))
        var workflow = worksmith("./stress-test/stress-workflows/workflow1.js")
        console.log('About to execute workflow1')
        calculateAverageExecTime(workflow, function(average) {
            console.log('The average execution time is: ', average, ' ms')
            next()
        })
    } catch(e) {
        next(e)
    }
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