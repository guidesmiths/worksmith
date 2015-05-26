var worksmith = require('..')
var assert = require('assert')
describe("random activity", function() {
    it("should produce a random num", function(done) {
        var wf = worksmith({task:"random", resultTo:"r" });
        wf({}, function(err, result, ctx) {
            assert.ifError(err, err);
            assert.ok(ctx.r, "result must be set")
            assert.equal(typeof ctx.r, "number")
            done(null, result)
        })
    })
    it("should produce a random string", function(done) {
        var wf = worksmith({task:"random", resultTo:"r", return:"string" });
        wf({}, function(err, result, ctx) {
            assert.ifError(err, err);
            assert.ok(ctx.r, "result must be set")
            assert.ok(ctx.r.match(/^[0-9\.]+$/), "result must be number")
            assert.equal(typeof ctx.r, "string")
            done(null, result)
        })
    })
})