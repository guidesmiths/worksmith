var assert = require('assert')
var workflow = require('../')

describe("WorkSmith setActivity", function() {


    it("should set a context field to a constant value", function(done) {
        var context = {};
        var wi = workflow({ "task":"set", "name":"field", "value":"value" })(context);

        wi(function(err, result) {
            assert.equal(context.field, "value", "context field  must be set")
            done();
        })
    })

    it("should set a context field to a reference value", function(done) {
        var context = { field1: "value1" };
        var wi = workflow({ "task":"set", "name":"field2", "value":"@field1" })(context);

        wi(function(err, result) {
            assert.equal(context.field2, "value1", "context field  must be set")
            done();
        })
    })


})