var worksmith = require('..')
var _ = require('lodash')
packageJson = require('../package.json')

console.log('Stress tests for worksmith version ', packageJson.version)

try {

    worksmith.use("lodash", worksmith.createAdapter(require('lodash')))
    var workflow = worksmith("./stress-test/stress-workflows/workflow1.js")
    var ctx = {}
    workflow(ctx, function(err, results) { if (err) console.error('There was an error running a workflow: ', err.toString()) })

} catch(e) {
    console.error('There was an error configuring old data deletion: ', e)
}