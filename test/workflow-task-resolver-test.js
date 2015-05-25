var assert = require('assert')
var worksmith = require('../')


describe("WorkSmith task resolution", function() {

    it("should set a context field to a constant value", function(done) {
        worksmith.use("myNS", function(taskName) {
            return function(definition) {
                return function(context) {
                    return function(done) {
                        done(null, taskName)
                    }
                }
            }
        })
        var context = {};
        var wi = worksmith({ "task":"myNS/abc", resultTo:"abc" })(context);

        wi(function(err, result) {
            assert.equal(context.abc, "abc", "context field  must be set")
            done();
        })
    })


})