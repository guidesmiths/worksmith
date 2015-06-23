var worksmith = require('..')
var assert = require('assert')

describe("delay activity", function() {

    it("should delay workflow", function(done) {
        this.slow()
        var wf = worksmith({task:"delay", duration:500 });
        var before = Date.now()
        wf({}, function(err, result, ctx) {
            var after = Date.now()
            assert.ok(after - before >= 500, 'The workflow was not delayed')
            done(null, result)
        })
    })
})