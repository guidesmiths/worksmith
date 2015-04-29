var assert = require('assert')
var workflow = require('../')

describe("mapActivity", function() {


    it("should map a simple object", function(done) {
        var context = {};

        var wi = workflow({ "task":"map", "map": {"a":1} , resultTo:"result" })(context);

        wi(function(err, result) {
            assert.deepEqual(context.result, {"a":1}, "map value incorrect")
            done();
        })
    })

    it("should map an object with context references", function(done) {
        var context = {"input":3};

        var wi = workflow({ "task":"map", "map": {"a":"@input"} , resultTo:"result" })(context);

        wi(function(err, result) {
            assert.deepEqual(context.result, {"a":3}, "map value incorrect")
            done();
        })
    })

    it("should map an object with resultTo shortcut", function(done) {
        var context = {"input":3};

        var wi = workflow({ "task":"map", ">result": {"a":"@input"} })(context);

        wi(function(err, result) {
            assert.deepEqual(context.result, {"a":3}, "map value incorrect")
            done();
        })
    })

})