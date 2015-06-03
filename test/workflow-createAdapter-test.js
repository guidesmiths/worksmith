var assert = require('assert')
var worksmith = require('../')

describe("WorkSmith API - createAdapter", function() {

    it("should invoke lodash.filter", function(done) {
        worksmith.use("_", worksmith.createAdapter(require('lodash')))
        var context = {items:[{field:"value"}, {field2:"value2"}]}
        var workflow = worksmith({
            task: "_/filter",
            arguments: ["@items", { field:"value"} ],
            resultTo: "myresult"
        })
        workflow(context, function wfresult(err, res, context) {
            assert.equal(context.myresult[0], context.items[0])
           done(); 
        });
    });
});