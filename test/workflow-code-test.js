var assert = require('assert')
var workflow = require('../')

describe("codeActivity", function () {
    
    
    it("should execute the code block", function (done) {
        var context = {};
        var flag;

        var wi = workflow({
            "task": "code", 
            "execute": function (done) {
                flag = true
                done()
            }
        })(context);
        
        wi(function (err, result) {
            assert.ok(flag, "code must be executed")
            done();
        })
    })
    
    it("should pass its result", function (done) {
        var context = {};
        var flag;
        
        var wi = workflow({
            "task": "code", 
            "execute": function (done) {
                flag = true
                done(null, 42)
            },
            "resultTo":"theAnswer"
        })(context);
        
        wi(function (err, result) {
            assert.equal(context.theAnswer, 42, "result must be passed")
            done();
        })
    })

})