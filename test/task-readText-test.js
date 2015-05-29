var worksmith = require('..')
var assert = require('assert')
describe("readText activity", function() {
    var expected = '{\r\n\
    "ever talked to kurtz?" :"you don\'t talk to kurtz. you listen to him."\r\n\
}'    
    it("should read up the specified file", function(done) {
        var wf = worksmith({task:"readText", resultTo:"r", path:"./test/sample.json" });
        wf({}, function(err, result, ctx) {
            assert.ifError(err, err);
            assert.equal(ctx.r,expected, "result does not match")
            done(null, result)
        })
    })
    

    
})